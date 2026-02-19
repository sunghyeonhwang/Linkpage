import api from './api';
import type { Profile, ApiResponse } from '@linkpage/shared';

export const profileApi = {
  getProfiles() {
    return api.get<ApiResponse<Profile[]>>('/me/profile');
  },

  getProfile(profileId: string) {
    return api.get<ApiResponse<Profile>>(`/me/profile/${profileId}`);
  },

  updateProfile(profileId: string, data: Partial<Profile>) {
    return api.put<ApiResponse<Profile>>(`/me/profile/${profileId}`, data);
  },

  updateSlug(profileId: string, slug: string) {
    return api.post<ApiResponse<Profile>>(`/me/profile/${profileId}/slug`, { slug });
  },

  uploadAvatar(profileId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<ApiResponse<{ avatar_url: string }>>(
      `/me/profile/${profileId}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  uploadBackgroundImage(profileId: string, file: File) {
    const formData = new FormData();
    formData.append('background', file);
    return api.post<ApiResponse<{ background_image_url: string }>>(
      `/me/profile/${profileId}/background-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  removeBackgroundImage(profileId: string) {
    return api.delete<ApiResponse<{ background_image_url: null }>>(
      `/me/profile/${profileId}/background-image`,
    );
  },

  createProfile(displayName?: string) {
    return api.post<ApiResponse<Profile>>('/me/profile', { display_name: displayName });
  },

  deleteProfile(profileId: string) {
    return api.delete<ApiResponse>(`/me/profile/${profileId}`);
  },
};
