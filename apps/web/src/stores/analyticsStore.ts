import { create } from 'zustand';
import { analyticsApi } from '../services/analyticsApi';
import type { AnalyticsData, AnalyticsPeriod } from '@linkpage/shared';

interface AnalyticsState {
  data: AnalyticsData | null;
  period: AnalyticsPeriod;
  loading: boolean;
  fetchAnalytics: (profileId: string) => Promise<void>;
  setPeriod: (period: AnalyticsPeriod) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  data: null,
  period: '7d',
  loading: false,

  async fetchAnalytics(profileId: string) {
    set({ loading: true });
    try {
      const { data } = await analyticsApi.getAnalytics(profileId, get().period);
      if (data.data) {
        set({ data: data.data });
      }
    } catch {
      // silently fail
    } finally {
      set({ loading: false });
    }
  },

  setPeriod(period: AnalyticsPeriod) {
    set({ period });
  },
}));
