import { NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export const dynamic = 'force-dynamic';

let awsClient: AwsClient | null = null;

function getAwsClient(accessKeyId: string, secretAccessKey: string) {
  if (!awsClient) {
    awsClient = new AwsClient({
      accessKeyId,
      secretAccessKey,
      region: 'auto',
      service: 's3',
    });
  }
  return awsClient;
}

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
        { error: 'Cloudflare R2 credentials are not configured in environment variables.' },
        { status: 500 }
      );
    }

    // Create an edge-native AWS client using aws4fetch
    const aws = getAwsClient(accessKeyId, secretAccessKey);

    // Fetch all objects recursively from Cloudflare R2
    const contents: { Key: string; Size: number; LastModified: string }[] = [];
    let currentContinuationToken: string | null = null;
    let hasMore = true;
    let safetyCounter = 0;

    while (hasMore && safetyCounter < 30) { // Limit to 30,000 keys max for safety
      safetyCounter++;
      const r2Url = new URL(`https://${accountId}.r2.cloudflarestorage.com/${bucketName}`);
      r2Url.searchParams.set('list-type', '2');
      r2Url.searchParams.set('max-keys', '1000'); // Retrieve maximum page size
      if (currentContinuationToken) {
        r2Url.searchParams.set('continuation-token', currentContinuationToken);
      }

      // Sign request
      const listRequest = await aws.sign(r2Url.toString(), {
        method: 'GET',
      });

      // Execute call to list objects
      const response = await fetch(listRequest);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 storage service returned status ${response.status}: ${errorText}`);
      }

      const xmlText = await response.text();

      // Parse the XML Contents nodes with regex
      const contentRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
      let match;
      let countThisBatch = 0;

      while ((match = contentRegex.exec(xmlText)) !== null) {
        const contentBlock = match[1];
        const keyMatch = contentBlock.match(/<Key>([^<]+)<\/Key>/);
        const sizeMatch = contentBlock.match(/<Size>([^<]+)<\/Size>/);
        const lastModifiedMatch = contentBlock.match(/<LastModified>([^<]+)<\/LastModified>/);

        if (keyMatch) {
          contents.push({
            Key: keyMatch[1],
            Size: sizeMatch ? parseInt(sizeMatch[1], 10) : 0,
            LastModified: lastModifiedMatch ? lastModifiedMatch[1] : '',
          });
          countThisBatch++;
        }
      }

      // Check for NextContinuationToken
      const nextTokenMatch = xmlText.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
      currentContinuationToken = nextTokenMatch ? nextTokenMatch[1] : null;

      if (!currentContinuationToken || countThisBatch === 0) {
        hasMore = false;
      }
    }

    // Sort contents by LastModified date in descending order (newest first)
    contents.sort((a, b) => {
      const dateA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
      const dateB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
      return dateB - dateA;
    });

    // Paginate sorted contents in memory using offsets
    const offset = continuationToken ? parseInt(continuationToken, 10) : 0;
    const paginatedContents = contents.slice(offset, offset + limit);
    const nextOffset = offset + limit;
    const nextContinuationToken = nextOffset < contents.length ? nextOffset.toString() : null;

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
    const images = paginatedContents.map((item) => {
      const key = item.Key || '';
      const size = item.Size || 0;
      const lastModified = item.LastModified || null;
      const url = `${publicBaseUrl.replace(/\/$/, '')}/${key}`;

      // Extract user_id from key format wishes/{user_id}/filename
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
