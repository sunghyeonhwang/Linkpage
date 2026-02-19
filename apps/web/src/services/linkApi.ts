import api from './api';
import type { ProfileLink, ApiResponse } from '@linkpage/shared';

export const linkApi = {
  getLinks(profileId: string) {
    return api.get<ApiResponse<ProfileLink[]>>(`/me/links/${profileId}`);
  },

  createLink(profileId: string, data: Partial<ProfileLink>) {
    return api.post<ApiResponse<ProfileLink>>(`/me/links/${profileId}`, data);
  },

  updateLink(profileId: string, linkId: string, data: Partial<ProfileLink>) {
    return api.put<ApiResponse<ProfileLink>>(`/me/links/${profileId}/${linkId}`, data);
  },

  deleteLink(profileId: string, linkId: string) {
    return api.delete<ApiResponse>(`/me/links/${profileId}/${linkId}`);
  },

  reorderLinks(profileId: string, links: { id: string; sort_order: number }[]) {
    return api.put<ApiResponse<ProfileLink[]>>(`/me/links/${profileId}/reorder`, { links });
  },
};
