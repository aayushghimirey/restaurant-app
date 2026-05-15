import api from '../lib/api';
import type { ApiResponse } from '../types';

export const fileService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post<ApiResponse<String>>('/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
