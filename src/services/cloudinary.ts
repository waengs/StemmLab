import { cloudinaryEnv } from '../config/env';

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.uploadPreset);
}

export async function uploadVideoToCloudinary(
  localUri: string,
  options?: { folder?: string; publicId?: string }
): Promise<string> {
  const { cloudName, uploadPreset } = cloudinaryEnv;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env, then restart Expo.'
    );
  }

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: 'video/mp4',
    name: `slow-mo-${Date.now()}.mp4`,
  } as unknown as Blob);
  formData.append('upload_preset', uploadPreset);

  if (options?.folder) {
    formData.append('folder', options.folder);
  }
  if (options?.publicId) {
    formData.append('public_id', options.publicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = 'Video upload failed';
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error('Upload succeeded but no video URL was returned');
  }

  return data.secure_url;
}
