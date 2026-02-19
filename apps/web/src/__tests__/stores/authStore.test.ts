import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('초기 상태는 미인증이다', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth로 인증 상태를 설정한다', () => {
    useAuthStore.getState().setAuth('test-token', {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: true,
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('test-token');
    expect(state.user?.email).toBe('test@example.com');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('setUser로 사용자 정보만 업데이트한다', () => {
    useAuthStore.getState().setAuth('token', {
      id: 'user-1',
      email: 'old@example.com',
      emailVerified: false,
    });

    useAuthStore.getState().setUser({
      id: 'user-1',
      email: 'new@example.com',
      emailVerified: true,
    });

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('new@example.com');
    expect(state.token).toBe('token');
  });

  it('logout으로 상태를 초기화한다', () => {
    useAuthStore.getState().setAuth('token', {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setLoading으로 로딩 상태를 변경한다', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
