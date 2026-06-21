import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      try {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'scripts', 'api-errors.log');
        const logMessage = `[${new Date().toISOString()}] Auth Failure: ${authError?.message || 'No user session found in cookies'}\n`;
        fs.appendFileSync(logPath, logMessage);
      } catch (logErr) {}
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Parameters
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { filename, contentType, contentLength } = body;

    if (!contentType || !contentLength) {
      return NextResponse.json(
        { error: 'Missing contentType or contentLength' },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Content-Type '${contentType}' is not allowed. Only jpeg, png, webp are supported.` },
        { status: 400 }
      );
    }

    const size = parseInt(contentLength, 10);
    if (isNaN(size) || size <= 0) {
      return NextResponse.json(
        { error: 'Invalid contentLength value' },
        { status: 400 }
      );
    }

    // Fetch user's plan to determine allowed size and count limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile plan for upload:', profileError);
    }

    const plan = profile?.plan || 'free';
    const maxSizeBytes = plan === 'creator' ? 5 * 1024 * 1024 : plan === 'starter' ? 3 * 1024 * 1024 : 2 * 1024 * 1024;
    const maxSizeLabel = plan === 'creator' ? '5MB' : plan === 'starter' ? '3MB' : '2MB';
    const maxImages = plan === 'creator' ? 40 : plan === 'starter' ? 15 : 6;

    // Check count of current images in gallery
    const { count: imageCount, error: countError } = await supabase
      .from('user_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error checking gallery image count limit:', countError);
    } else if (imageCount !== null && imageCount >= maxImages) {
      return NextResponse.json(
        { error: `Gallery limit reached (${imageCount}/${maxImages}). Please delete some images from your dashboard first or upgrade your plan.` },
        { status: 403 }
      );
    }

    if (size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File size exceeds the ${maxSizeLabel} limit for the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.` },
        { status: 400 }
      );
    }

    // 3. Generate Unique Key and Filename Ext
    const fileExt = contentType === 'image/webp' ? 'webp' : contentType === 'image/png' ? 'png' : 'jpg';
    const objectKey = `wishes/${user.id}/${Date.now()}-${uuidv4()}.${fileExt}`;

    // 4. Initialize R2 Client (using S3 API compatibility)
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || 'msgreplier-images';
    const publicBaseUrl = process.env.R2_PUBLIC_URL || 'https://images.msgreplier.com';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('R2 configuration environment variables are missing');
      return NextResponse.json(
        { error: 'R2 storage service is not configured' },
        { status: 500 }
      );
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // 5. Generate Presigned URL
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
      ContentLength: size,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      objectKey,
    });
  } catch (error: any) {
    console.error('Presign URL generation error:', error);
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'scripts', 'api-errors.log');
      const logMessage = `[${new Date().toISOString()}] Server Error: ${error?.message || error}\nStack: ${error?.stack || ''}\n`;
      fs.appendFileSync(logPath, logMessage);
    } catch (logErr) {}
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
