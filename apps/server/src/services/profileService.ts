import { profileRepository } from '../repositories/profileRepository.js';
import { AppError } from '../middleware/error.js';
import type { Profile } from '@linkpage/shared';

export const profileService = {
  async getProfiles(userId: string): Promise<Profile[]> {
    let profiles = await profileRepository.findByUserId(userId);
    if (profiles.length === 0) {
      const profile = await profileRepository.create(userId);
      profiles = [profile];
    }
    return profiles;
  },

  async getProfile(userId: string, profileId?: string): Promise<Profile> {
    if (profileId) {
      const profile = await profileRepository.findById(profileId);
      if (!profile || profile.user_id !== userId) {
        throw new AppError(404, '프로필을 찾을 수 없습니다', 'PROFILE_NOT_FOUND');
      }
      return profile;
    }

    const profiles = await this.getProfiles(userId);
    return profiles[0];
  },

  async updateProfile(userId: string, profileId: string, data: Partial<Profile>): Promise<Profile> {
    const profile = await profileRepository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new AppError(404, '프로필을 찾을 수 없습니다', 'PROFILE_NOT_FOUND');
    }

    const updated = await profileRepository.update(profileId, data);
    if (!updated) {
      throw new AppError(500, '프로필 업데이트에 실패했습니다', 'UPDATE_FAILED');
    }
    return updated;
  },

  async updateSlug(userId: string, profileId: string, slug: string): Promise<Profile> {
    const profile = await profileRepository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new AppError(404, '프로필을 찾을 수 없습니다', 'PROFILE_NOT_FOUND');
    }

    const available = await profileRepository.isSlugAvailable(slug, profileId);
    if (!available) {
      throw new AppError(409, '이미 사용 중인 슬러그입니다', 'SLUG_TAKEN');
    }

    const updated = await profileRepository.updateSlug(profileId, slug);
    if (!updated) {
      throw new AppError(500, '슬러그 업데이트에 실패했습니다', 'UPDATE_FAILED');
    }
    return updated;
  },

  async createProfile(userId: string, displayName?: string): Promise<Profile> {
    return profileRepository.create(userId, displayName);
  },

  async deleteProfile(userId: string, profileId: string): Promise<void> {
    const profile = await profileRepository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new AppError(404, '프로필을 찾을 수 없습니다', 'PROFILE_NOT_FOUND');
    }

    const profiles = await profileRepository.findByUserId(userId);
    if (profiles.length <= 1) {
      throw new AppError(400, '최소 1개의 프로필이 필요합니다', 'MIN_PROFILE');
    }

    await profileRepository.delete(profileId);
  },
};
