import { cloudinaryEnv } from '../config/env';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.uploadPreset);
}

export async function uploadVideoToCloudinary(
  localUri: string,
  options?: { folder?: string; publicId?: string }
): Promise<string> {
  const { cloudName, uploadPreset, slowmoFolder } = cloudinaryEnv;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env, then restart Expo.'
    );
  }
  const folder = options?.folder ?? slowmoFolder;
  
  if (Platform.OS === 'web') {
    const formData = new FormData();
    const fileResp = await fetch(localUri);
    const blob = await fileResp.blob();
    formData.append('file', blob, `slow-mo-${Date.now()}.mp4`);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
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
      } catch {}
      throw new Error(message);
    }

    const data = (await response.json()) as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error('Upload succeeded but no video URL was returned');
    }
    return data.secure_url;
  } else {
    // Native (Android/iOS) bypasses React Native FormData bugs using FileSystem.uploadAsync
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
    
    const parameters: Record<string, string> = {
      upload_preset: uploadPreset,
    };
    if (folder) {
      parameters.folder = folder;
    }
    if (options?.publicId) {
      parameters.public_id = options.publicId;
    }

    const response = await FileSystem.uploadAsync(url, localUri, {
      httpMethod: 'POST',
      uploadType: 1, // FileSystem.FileSystemUploadType.MULTIPART = 1
      fieldName: 'file',
      mimeType: 'video/mp4',
      parameters,
    });

    if (response.status !== 200) {
      throw new Error(`Video upload failed with status ${response.status}`);
    }
    
    const data = JSON.parse(response.body) as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error('Upload succeeded but no video URL was returned');
    }
    return data.secure_url;
  }
}
export async function uploadFileToCloudinary(
  localUri: string,
  mimeType: string,
  options?: { folder?: string; publicId?: string }
): Promise<string> {
  const { cloudName, uploadPreset, forumFolder } = cloudinaryEnv;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env, then restart Expo.'
    );
  }
  const folder = options?.folder ?? forumFolder;
  
  if (Platform.OS === 'web') {
    const formData = new FormData();
    const fileResp = await fetch(localUri);
    const blob = await fileResp.blob();
    const extension = mimeType.split('/')[1] || 'bin';
    formData.append('file', blob, `forum-attachment-${Date.now()}.${extension}`);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }
    if (options?.publicId) {
      formData.append('public_id', options.publicId);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = 'Image upload failed';
      try {
        const body = (await response.json()) as { error?: { message?: string } };
        message = body.error?.message ?? message;
      } catch {}
      throw new Error(message);
    }

    const data = (await response.json()) as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error('Upload succeeded but no file URL was returned');
    }
    return data.secure_url;
  } else {
    // Native (Android/iOS) bypasses React Native FormData bugs using FileSystem.uploadAsync
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    const parameters: Record<string, string> = {
      upload_preset: uploadPreset,
    };
    if (folder) {
      parameters.folder = folder;
    }
    if (options?.publicId) {
      parameters.public_id = options.publicId;
    }

    let fileToUpload = localUri;
    
    // On Android, DocumentPicker with copyToCacheDirectory: false returns content:// URIs.
    // We manually copy it to a safe local file path to avoid Expo permissions bugs and illegal filename characters.
    if (localUri.startsWith('content://')) {
      const extension = mimeType.split('/')[1] || 'bin';
      fileToUpload = `${FileSystem.cacheDirectory}safe_upload_${Date.now()}.${extension}`;
      await FileSystem.copyAsync({ from: localUri, to: fileToUpload });
    }

    let responseBody = '';
    let responseStatus = 0;

    try {
      const response = await FileSystem.uploadAsync(url, fileToUpload, {
        httpMethod: 'POST',
        uploadType: 1, // FileSystem.FileSystemUploadType.MULTIPART = 1
        fieldName: 'file',
        mimeType: mimeType || 'application/octet-stream',
        parameters,
      });
      responseBody = response.body;
      responseStatus = response.status;
    } catch (uploadError) {
      console.warn('uploadAsync failed, falling back to base64:', uploadError);
      
      // Fallback: Read as base64 from the safely copied fileToUpload
      // This uses React Native's highly reliable native file stream
      const base64 = await FileSystem.readAsStringAsync(fileToUpload, { encoding: 'base64' });
      const dataUrl = `data:${mimeType || 'application/octet-stream'};base64,${base64}`;
      
      const formData = new FormData();
      formData.append('file', dataUrl);
      formData.append('upload_preset', uploadPreset);
      if (folder) formData.append('folder', folder);
      if (options?.publicId) formData.append('public_id', options.publicId);

      const fetchRes = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      responseStatus = fetchRes.status;
      responseBody = await fetchRes.text();
    }

    // Cleanup the safe copy
    if (localUri !== fileToUpload) {
      try {
        await FileSystem.deleteAsync(fileToUpload, { idempotent: true });
      } catch (e) {}
    }

    if (responseStatus !== 200) {
      throw new Error(`File upload failed with status ${responseStatus}: ${responseBody}`);
    }
    
    const data = JSON.parse(responseBody) as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error('Upload succeeded but no file URL was returned');
    }
    return data.secure_url;
  }
}
