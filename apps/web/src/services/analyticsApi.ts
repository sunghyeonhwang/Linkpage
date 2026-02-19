import api from './api';
import type { ApiResponse, AnalyticsData, AnalyticsPeriod } from '@linkpage/shared';

export const analyticsApi = {
  getAnalytics(profileId: string, period: AnalyticsPeriod) {
    return api.get<ApiResponse<AnalyticsData>>(
      `/me/profile/${profileId}/analytics`,
      { params: { period } },
    );
  },
};
