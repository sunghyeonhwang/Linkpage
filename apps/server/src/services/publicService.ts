import { profileRepository } from '../repositories/profileRepository.js';
import { linkRepository } from '../repositories/linkRepository.js';
import { AppError } from '../middleware/error.js';
import type { PublicProfile } from '@linkpage/shared';

export const publicService = {
  async getPublicProfile(slug: string): Promise<PublicProfile> {
    const profile = await profileRepository.findBySlug(slug);
    if (!profile) {
      throw new AppError(404, '페이지를 찾을 수 없습니다', 'NOT_FOUND');
    }

    const links = await linkRepository.findActiveByProfileId(profile.id);

    const { user_id, ...profileData } = profile;

    return {
      profile: profileData,
      links: links.map(({ profile_id, ...link }) => link),
    };
  },
};
