/**
 * Mock Storage Service
 * 
 * This service abstracts away file uploading.
 * Currently, it uses URL.createObjectURL to simulate cloud storage URLs locally.
 * In the future, swap this implementation with AWS S3, Firebase Storage, etc.
 */

export const storageService = {
  /**
   * Uploads a file and returns its accessible URL.
   */
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/admin/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error || 'Upload failed');
      }
      return json.data.url;
    } catch (err) {
      console.error('File upload error:', err);
      throw err;
    }
  }
};
