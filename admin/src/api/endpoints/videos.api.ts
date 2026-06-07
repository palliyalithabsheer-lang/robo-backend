import { apiRequest } from '../client';
import type { ApiResponse } from '../../types';

const BASE = '/admin/videos';

export const videosApi = {
  getAll: (): Promise<ApiResponse<any[]>> =>
    apiRequest<any[]>(BASE),

  create: (data: Record<string, any>): Promise<ApiResponse<{ id: string }>> =>
    apiRequest<{ id: string }>(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, any>): Promise<ApiResponse<{ id: string }>> =>
    apiRequest<{ id: string }>(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string): Promise<ApiResponse<{ id: string; status: string }>> =>
    apiRequest<{ id: string; status: string }>(`${BASE}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiRequest<null>(`${BASE}/${id}`, {
      method: 'DELETE',
    }),
};
