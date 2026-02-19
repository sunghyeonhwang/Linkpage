import { create } from 'zustand';
import type { Profile } from '@linkpage/shared';
import { profileApi } from '../services/profileApi';

interface ProfileState {
  profiles: Profile[];
  currentProfileId: string | null;
  loading: boolean;
  currentProfile: Profile | null;
  fetchProfiles: () => Promise<void>;
  setCurrentProfile: (id: string) => void;
  updateProfile: (profileId: string, data: Partial<Profile>) => Promise<void>;
  updateSlug: (profileId: string, slug: string) => Promise<void>;
  uploadAvatar: (profileId: string, file: File) => Promise<string>;
  uploadBackgroundImage: (profileId: string, file: File) => Promise<string>;
  removeBackgroundImage: (profileId: string) => Promise<void>;
  createProfile: (displayName?: string) => Promise<Profile>;
  deleteProfile: (profileId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  currentProfileId: null,
  loading: false,
  currentProfile: null,

  fetchProfiles: async () => {
    set({ loading: true });
    try {
      const { data } = await profileApi.getProfiles();
      const profiles = data.data || [];
      const currentId = get().currentProfileId || profiles[0]?.id || null;
      set({
        profiles,
        currentProfileId: currentId,
        currentProfile: profiles.find((p) => p.id === currentId) || profiles[0] || null,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  setCurrentProfile: (id) => {
    const profiles = get().profiles;
    set({
      currentProfileId: id,
      currentProfile: profiles.find((p) => p.id === id) || null,
    });
  },

  updateProfile: async (profileId, data) => {
    const { data: res } = await profileApi.updateProfile(profileId, data);
    if (res.data) {
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === profileId ? res.data! : p)),
        currentProfile: state.currentProfileId === profileId ? res.data! : state.currentProfile,
      }));
    }
  },

  updateSlug: async (profileId, slug) => {
    const { data: res } = await profileApi.updateSlug(profileId, slug);
    if (res.data) {
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === profileId ? res.data! : p)),
        currentProfile: state.currentProfileId === profileId ? res.data! : state.currentProfile,
      }));
    }
  },

  uploadAvatar: async (profileId, file) => {
    const { data: res } = await profileApi.uploadAvatar(profileId, file);
    const avatarUrl = res.data?.avatar_url || '';
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, avatar_url: avatarUrl } : p,
      ),
      currentProfile:
        state.currentProfileId === profileId
          ? { ...state.currentProfile!, avatar_url: avatarUrl }
          : state.currentProfile,
    }));
    return avatarUrl;
  },

  uploadBackgroundImage: async (profileId, file) => {
    const { data: res } = await profileApi.uploadBackgroundImage(profileId, file);
    const bgUrl = res.data?.background_image_url || '';
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, background_image_url: bgUrl } : p,
      ),
      currentProfile:
        state.currentProfileId === profileId
          ? { ...state.currentProfile!, background_image_url: bgUrl }
          : state.currentProfile,
    }));
    return bgUrl;
  },

  removeBackgroundImage: async (profileId) => {
    await profileApi.removeBackgroundImage(profileId);
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, background_image_url: null } : p,
      ),
      currentProfile:
        state.currentProfileId === profileId
          ? { ...state.currentProfile!, background_image_url: null }
          : state.currentProfile,
    }));
  },

  createProfile: async (displayName) => {
    const { data: res } = await profileApi.createProfile(displayName);
    const profile = res.data!;
    set((state) => ({
      profiles: [...state.profiles, profile],
    }));
    return profile;
  },

  deleteProfile: async (profileId) => {
    await profileApi.deleteProfile(profileId);
    set((state) => {
      const profiles = state.profiles.filter((p) => p.id !== profileId);
      const newCurrentId = state.currentProfileId === profileId
        ? profiles[0]?.id || null
        : state.currentProfileId;
      return {
        profiles,
        currentProfileId: newCurrentId,
        currentProfile: profiles.find((p) => p.id === newCurrentId) || null,
      };
    });
  },
}));
