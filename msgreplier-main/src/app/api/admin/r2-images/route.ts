import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, continuationToken, limit = 50 } = body || {};

    const adminPassword = process.env.ADMIN_PASSWORD || 'msgreplier-admin-2026';

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin password' }, { status: 401 });
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || 'msgreplier-images';
    const publicBaseUrl = process.env.R2_PUBLIC_URL || 'https://images.msgreplier.com';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: 'Cloudflare R2 storage credentials are not configured in environment variables.' },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: limit,
      ContinuationToken: continuationToken || undefined,
    });

    const response = await s3.send(command);
    const contents = response.Contents || [];
    const nextContinuationToken = response.NextContinuationToken || null;

    // Fetch user profiles to map user_id to email address
    const { client: supabase } = getSupabaseAdmin();
    const profilesMap = new Map<string, string>();

    if (supabase) {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');
        
        if (!profilesError && profiles) {
          profiles.forEach((profile) => {
            profilesMap.set(profile.id, profile.email);
          });
        }
      } catch (err) {
        console.error('[R2 Images Admin API] Failed to fetch profiles:', err);
      }
    }

    // Process listed objects
    const images = contents.map((item) => {
      const key = item.Key || '';
      const size = item.Size || 0;
      const lastModified = item.LastModified || null;
      const url = `${publicBaseUrl.replace(/\/$/, '')}/${key}`;

      // Extract user_id from the key format 'wishes/user_id/filename'
      const keyMatch = key.match(/^wishes\/([^/]+)\//);
      const userId = keyMatch ? keyMatch[1] : null;
      const email = userId ? profilesMap.get(userId) : null;

      return {
        key,
        url,
        size,
        lastModified,
        userId,
        email: email || null,
      };
    });

    return NextResponse.json({
      images,
      nextContinuationToken,
    });
  } catch (error: any) {
    console.error('[R2 Images Admin API] Error listing images:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message || error },
      { status: 500 }
    );
  }
}
