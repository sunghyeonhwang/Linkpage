import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser, cleanupTestData } from '../helpers/setup.js';

let user: { id: string; email: string; token: string };
let profileId: string;

beforeAll(async () => {
  await cleanupTestData();
  user = await createTestUser();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('GET /api/me/profile', () => {
  it('200 - 프로필 목록 조회 (자동 생성 포함)', async () => {
    const res = await request(app)
      .get('/api/me/profile')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    profileId = res.body.data[0].id;
  });

  it('401 - 인증 없이 접근', async () => {
    const res = await request(app).get('/api/me/profile');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/me/profile/:profileId', () => {
  it('200 - 특정 프로필 조회', async () => {
    const res = await request(app)
      .get(`/api/me/profile/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(profileId);
  });

  it('404 - 다른 사용자의 프로필 조회', async () => {
    const otherUser = await createTestUser();
    const otherProfiles = await request(app)
      .get('/api/me/profile')
      .set('Authorization', `Bearer ${otherUser.token}`);
    const otherProfileId = otherProfiles.body.data[0].id;

    const res = await request(app)
      .get(`/api/me/profile/${otherProfileId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/me/profile/:profileId', () => {
  it('200 - 프로필 수정', async () => {
    const res = await request(app)
      .put(`/api/me/profile/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ display_name: 'Updated Name', bio: 'My bio' });

    expect(res.status).toBe(200);
    expect(res.body.data.display_name).toBe('Updated Name');
    expect(res.body.data.bio).toBe('My bio');
  });

  it('200 - 테마 프리셋 변경', async () => {
    const res = await request(app)
      .put(`/api/me/profile/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ theme_preset: 'midnight-dark' });

    expect(res.status).toBe(200);
    expect(res.body.data.theme_preset).toBe('midnight-dark');
  });

  it('400 - display_name 50자 초과', async () => {
    const res = await request(app)
      .put(`/api/me/profile/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ display_name: 'a'.repeat(51) });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/me/profile/:profileId/slug', () => {
  it('200 - 슬러그 변경', async () => {
    const slug = `test-slug-${Date.now()}`;
    const res = await request(app)
      .post(`/api/me/profile/${profileId}/slug`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ slug });

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(slug);
  });

  it('400 - 잘못된 슬러그 형식', async () => {
    const res = await request(app)
      .post(`/api/me/profile/${profileId}/slug`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ slug: 'AB' });

    expect(res.status).toBe(400);
  });

  it('409 - 중복 슬러그', async () => {
    const slug = `dup-slug-${Date.now()}`;
    // 먼저 다른 사용자 프로필에 슬러그 설정
    const otherUser = await createTestUser();
    const otherProfiles = await request(app)
      .get('/api/me/profile')
      .set('Authorization', `Bearer ${otherUser.token}`);
    await request(app)
      .post(`/api/me/profile/${otherProfiles.body.data[0].id}/slug`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send({ slug });

    // 같은 슬러그로 변경 시도
    const res = await request(app)
      .post(`/api/me/profile/${profileId}/slug`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ slug });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/me/profile', () => {
  it('201 - 새 프로필 생성', async () => {
    const res = await request(app)
      .post('/api/me/profile')
      .set('Authorization', `Bearer ${user.token}`)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('slug');
  });
});

describe('DELETE /api/me/profile/:profileId', () => {
  it('200 - 프로필 삭제 (2개 이상일 때)', async () => {
    // 프로필 하나 더 생성
    const createRes = await request(app)
      .post('/api/me/profile')
      .set('Authorization', `Bearer ${user.token}`)
      .send({});
    const newProfileId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/me/profile/${newProfileId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
  });
});
