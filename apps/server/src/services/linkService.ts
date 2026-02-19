import { profileRepository } from '../repositories/profileRepository.js';
import { linkRepository } from '../repositories/linkRepository.js';
import { AppError } from '../middleware/error.js';
import type { ProfileLink } from '@linkpage/shared';

async function verifyProfileOwner(userId: string, profileId: string) {
  const profile = await profileRepository.findById(profileId);
  if (!profile || profile.user_id !== userId) {
    throw new AppError(404, '프로필을 찾을 수 없습니다', 'PROFILE_NOT_FOUND');
  }
  return profile;
}

export const linkService = {
  async getLinks(userId: string, profileId: string): Promise<ProfileLink[]> {
    await verifyProfileOwner(userId, profileId);
    return linkRepository.findByProfileId(profileId);
  },

  async createLink(userId: string, profileId: string, data: Partial<ProfileLink>): Promise<ProfileLink> {
    await verifyProfileOwner(userId, profileId);

    const links = await linkRepository.findByProfileId(profileId);
    if (links.length >= 50) {
      throw new AppError(400, '링크는 최대 50개까지 추가할 수 있습니다', 'MAX_LINKS');
    }

    return linkRepository.create(profileId, data);
  },

  async updateLink(userId: string, profileId: string, linkId: string, data: Partial<ProfileLink>): Promise<ProfileLink> {
    await verifyProfileOwner(userId, profileId);

    const link = await linkRepository.findById(linkId);
    if (!link || link.profile_id !== profileId) {
      throw new AppError(404, '링크를 찾을 수 없습니다', 'LINK_NOT_FOUND');
    }

    const updated = await linkRepository.update(linkId, data);
    if (!updated) {
      throw new AppError(500, '링크 업데이트에 실패했습니다', 'UPDATE_FAILED');
    }
    return updated;
  },

  async deleteLink(userId: string, profileId: string, linkId: string): Promise<void> {
    await verifyProfileOwner(userId, profileId);

    const link = await linkRepository.findById(linkId);
    if (!link || link.profile_id !== profileId) {
      throw new AppError(404, '링크를 찾을 수 없습니다', 'LINK_NOT_FOUND');
    }

    await linkRepository.delete(linkId);
  },

  async reorderLinks(
    userId: string,
    profileId: string,
    links: { id: string; sort_order: number }[],
  ): Promise<ProfileLink[]> {
    await verifyProfileOwner(userId, profileId);
    await linkRepository.reorder(links);
    return linkRepository.findByProfileId(profileId);
  },
};
