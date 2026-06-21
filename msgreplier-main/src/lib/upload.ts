import imageCompression from 'browser-image-compression';

export interface UploadProgressCallback {
  (percentage: number): void;
}

/**
 * Compresses an image client-side using browser-image-compression.
 * - Resizes max width/height to 1920px.
 * - Target maximum file size: 500KB (0.5MB).
 * - Converts image to WebP format.
 * - Uses Web Workers to keep UI responsive.
 * 
 * @param file The original File object
 * @returns The optimized WebP File object
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 50, // High size limit so it doesn't iteratively degrade quality to fit a small target
    maxWidthOrHeight: 1920, // Max width/height of 1920px
    useWebWorker: true, // Use Web Workers
    fileType: 'image/webp', // Convert output to WebP
    initialQuality: 1.0, // Maintain maximum quality (no quality degradation)
  };

  const compressedBlob = await imageCompression(file, options);
  
  // Extract base name of file to create webp filename
  const lastDot = file.name.lastIndexOf('.');
  const baseName = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
  
  return new File([compressedBlob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

/**
 * Uploads a compressed File to Cloudflare R2 using a presigned upload URL
 * with progress tracking.
 * 
 * @param compressedFile The compressed WebP File
 * @param onProgress Callback to receive upload progress percentage (0-100)
 * @returns The public URL of the uploaded image
 */
export async function uploadCompressedImage(
  compressedFile: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 1. Request presigned URL from API route
  const response = await fetch('/api/upload/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: compressedFile.name,
      contentType: compressedFile.type,
      contentLength: compressedFile.size,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get upload signature from server');
  }

  const { uploadUrl, publicUrl } = await response.json();

  // 2. Perform direct browser-to-R2 PUT upload with progress reporting
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', compressedFile.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        // Cap progress at 99 until status 200 is received
        onProgress(Math.min(99, percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        onProgress?.(100);
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed with status code: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during file upload to storage'));
    };

    xhr.send(compressedFile);
  });
}

/**
 * Helper to compress and upload in a single flow.
 * (Maintained for backward compatibility)
 */
export async function uploadImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  onProgress?.(0);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 2MB limit. Please select an image below or equal to 2MB.');
  }
  const compressed = await compressImage(file);
  return uploadCompressedImage(compressed, onProgress);
}

