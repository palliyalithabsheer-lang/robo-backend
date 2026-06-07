/**
 * Storage Service — Direct Cloudinary Upload
 *
 * Files are uploaded directly from the browser to Cloudinary
 * using an unsigned upload preset. This avoids any server
 * timeout issues for large video files.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfyxp98lv';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'robo_unsigned';

export const storageService = {
  /**
   * Uploads a file directly to Cloudinary and returns its permanent CDN URL.
   */
  uploadFile: async (file: File): Promise<string> => {
    const isVideo = file.type.startsWith('video/');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', isVideo ? 'robo/videos' : 'robo/images');

    // 'auto' resource_type works for both images and videos
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error?.message || `Upload failed (${response.status})`);
    }

    return result.secure_url as string;
  },
};
