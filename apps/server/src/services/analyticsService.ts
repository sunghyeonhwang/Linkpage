import crypto from 'crypto';
import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { profileRepository } from '../repositories/profileRepository.js';
import { linkRepository } from '../repositories/linkRepository.js';
import { AppError } from '../middleware/error.js';
import type { AnalyticsData, AnalyticsPeriod } from '@linkpage/shared';

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export const analyticsService = {
  async trackView(
    profileId: string,
    referrer: string | null,
    userAgent: string | null,
    ip: string | null,
  ): Promise<void> {
    const profile = await profileRepository.findById(profileId);
    if (!profile) return;
    const ipHash = ip ? hashIp(ip) : null;
    await analyticsRepository.recordView(profileId, referrer, userAgent, ipHash);
  },

  async trackClick(
    linkId: string,
    profileId: string,
    referrer: string | null,
    userAgent: string | null,
    ip: string | null,
  ): Promise<void> {
    const link = await linkRepository.findById(linkId);
    if (!link || link.profile_id !== profileId) return;
    const ipHash = ip ? hashIp(ip) : null;
    await analyticsRepository.recordClick(linkId, profileId, referrer, userAgent, ipHash);
  },

  async getAnalytics(
    userId: string,
    profileId: string,
    period: AnalyticsPeriod = '7d',
  ): Promise<AnalyticsData> {
    const profile = await profileRepository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new AppError(403, '접근 권한이 없습니다', 'FORBIDDEN');
    }

    const days = PERIOD_DAYS[period] || 7;
    const [summary, dailyStats, linkStats] = await Promise.all([
      analyticsRepository.getSummary(profileId),
      analyticsRepository.getDailyStats(profileId, days),
      analyticsRepository.getLinkStats(profileId, days),
    ]);

    return { summary, dailyStats, linkStats };
  },
};
