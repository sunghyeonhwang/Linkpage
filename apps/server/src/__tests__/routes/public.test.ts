import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser, cleanupTestData } from '../helpers/setup.js';

let slug: string;
let profileId: string;
let token: string;

beforeAll(async () => {
  await cleanupTestData();
  const user = await createTestUser();
  token = user.token;

  // 프로필 가져오기
  const profileRes = await request(app)
    .get('/api/me/profile')
    .set('Authorization', `Bearer ${token}`);
  profileId = profileRes.body.data[0].id;
  slug = profileRes.body.data[0].slug;

  // 활성 링크 생성
  await request(app)
    .post(`/api/me/links/${profileId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ label: 'Active Link', url: 'https://active.com' });

  // 비활성 링크 생성
  const inactiveRes = await request(app)
    .post(`/api/me/links/${profileId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ label: 'Inactive Link', url: 'https://inactive.com' });
  await request(app)
    .put(`/api/me/links/${profileId}/${inactiveRes.body.data.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ is_active: false });
});

afterAll(async () => {
  await cleanupTestData();
});

describe('GET /api/public/profile/:slug', () => {
  it('200 - 공개 프로필 조회', async () => {
    const res = await request(app).get(`/api/public/profile/${slug}`);

    expect(res.status).toBe(200);
    expect(res.body.data.profile).toBeDefined();
    expect(res.body.data.links).toBeDefined();
    expect(res.body.data.profile.slug).toBe(slug);
  });

  it('활성 링크만 반환한다', async () => {
    const res = await request(app).get(`/api/public/profile/${slug}`);

    expect(res.status).toBe(200);
    const links = res.body.data.links;
    expect(links.every((l: { is_active: boolean }) => l.is_active === true)).toBe(true);
    expect(links.some((l: { label: string }) => l.label === 'Active Link')).toBe(true);
    expect(links.some((l: { label: string }) => l.label === 'Inactive Link')).toBe(false);
  });

  it('user_id를 노출하지 않는다', async () => {
    const res = await request(app).get(`/api/public/profile/${slug}`);

    expect(res.body.data.profile.user_id).toBeUndefined();
  });

  it('404 - 미존재 슬러그', async () => {
    const res = await request(app).get('/api/public/profile/nonexistent-slug-xyz');

    expect(res.status).toBe(404);
  });
});
