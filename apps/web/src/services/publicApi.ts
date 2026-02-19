import api from './api';
import type { PublicProfile, ApiResponse } from '@linkpage/shared';

export const publicApi = {
  getProfile(slug: string) {
    return api.get<ApiResponse<PublicProfile>>(`/public/profile/${slug}`);
  },
};
