import api from './api';
import type { AuthResponse, ApiResponse } from '@linkpage/shared';

export const authApi = {
  signup(email: string, password: string) {
    return api.post<ApiResponse<AuthResponse>>('/auth/signup', { email, password });
  },

  login(email: string, password: string) {
    return api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  },

  logout() {
    return api.post<ApiResponse>('/auth/logout');
  },

  getMe() {
    return api.get<ApiResponse<{ id: string; email: string; email_verified: boolean }>>('/auth/me');
  },

  verifyEmail(token: string) {
    return api.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
  },

  forgotPassword(email: string) {
    return api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  },

  resetPassword(token: string, password: string) {
    return api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
  },
};
