import { create } from 'zustand';
import type { ProfileLink } from '@linkpage/shared';
import { linkApi } from '../services/linkApi';

interface LinkState {
  links: ProfileLink[];
  loading: boolean;
  fetchLinks: (profileId: string) => Promise<void>;
  createLink: (profileId: string, data: Partial<ProfileLink>) => Promise<ProfileLink>;
  updateLink: (profileId: string, linkId: string, data: Partial<ProfileLink>) => Promise<void>;
  deleteLink: (profileId: string, linkId: string) => Promise<void>;
  reorderLinks: (profileId: string, links: ProfileLink[]) => Promise<void>;
  setLinks: (links: ProfileLink[]) => void;
}

export const useLinkStore = create<LinkState>((set) => ({
  links: [],
  loading: false,

  fetchLinks: async (profileId) => {
    set({ loading: true });
    try {
      const { data } = await linkApi.getLinks(profileId);
      set({ links: data.data || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createLink: async (profileId, data) => {
    const { data: res } = await linkApi.createLink(profileId, data);
    const link = res.data!;
    set((state) => ({ links: [...state.links, link] }));
    return link;
  },

  updateLink: async (profileId, linkId, data) => {
    const { data: res } = await linkApi.updateLink(profileId, linkId, data);
    if (res.data) {
      set((state) => ({
        links: state.links.map((l) => (l.id === linkId ? res.data! : l)),
      }));
    }
  },

  deleteLink: async (profileId, linkId) => {
    await linkApi.deleteLink(profileId, linkId);
    set((state) => ({
      links: state.links.filter((l) => l.id !== linkId),
    }));
  },

  reorderLinks: async (profileId, reorderedLinks) => {
    // Optimistic update
    set({ links: reorderedLinks });

    const linkOrders = reorderedLinks.map((l, i) => ({
      id: l.id,
      sort_order: i,
    }));

    try {
      const { data: res } = await linkApi.reorderLinks(profileId, linkOrders);
      if (res.data) {
        set({ links: res.data });
      }
    } catch {
      // Revert on error - refetch
      const { data } = await linkApi.getLinks(profileId);
      set({ links: data.data || [] });
    }
  },

  setLinks: (links) => set({ links }),
}));
