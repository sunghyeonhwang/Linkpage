import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser, cleanupTestData } from '../helpers/setup.js';

let user: { id: string; email: string; token: string };
let profileId: string;
let linkId: string;

beforeAll(async () => {
  await cleanupTestData();
  user = await createTestUser();
  // 프로필 자동 생성
  const profileRes = await request(app)
    .get('/api/me/profile')
    .set('Authorization', `Bearer ${user.token}`);
  profileId = profileRes.body.data[0].id;
});

afterAll(async () => {
  await cleanupTestData();
});

describe('POST /api/me/links/:profileId', () => {
  it('201 - 링크 생성', async () => {
    const res = await request(app)
      .post(`/api/me/links/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        label: 'My Blog',
        url: 'https://example.com',
        description: 'My personal blog',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.label).toBe('My Blog');
    expect(res.body.data.url).toBe('https://example.com');
    expect(res.body.data.is_active).toBe(true);
    linkId = res.body.data.id;
  });

  it('400 - 라벨 없음', async () => {
    const res = await request(app)
      .post(`/api/me/links/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ label: '', url: 'https://example.com' });

    expect(res.status).toBe(400);
  });

  it('400 - URL 형식 오류', async () => {
    const res = await request(app)
      .post(`/api/me/links/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ label: 'Test', url: 'not-a-url' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/me/links/:profileId', () => {
  it('200 - 링크 목록 조회', async () => {
    const res = await request(app)
      .get(`/api/me/links/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('PUT /api/me/links/:profileId/:linkId', () => {
  it('200 - 링크 수정', async () => {
    const res = await request(app)
      .put(`/api/me/links/${profileId}/${linkId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ label: 'Updated Blog', is_active: false });

    expect(res.status).toBe(200);
    expect(res.body.data.label).toBe('Updated Blog');
    expect(res.body.data.is_active).toBe(false);
  });

  it('200 - URL만 수정', async () => {
    const res = await request(app)
      .put(`/api/me/links/${profileId}/${linkId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ url: 'https://updated.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.url).toBe('https://updated.com');
  });
});

describe('PUT /api/me/links/:profileId/reorder', () => {
  it('200 - 링크 재정렬', async () => {
    // 추가 링크 생성
    const link2Res = await request(app)
      .post(`/api/me/links/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ label: 'Link 2', url: 'https://link2.com' });
    const link2Id = link2Res.body.data.id;

    const res = await request(app)
      .put(`/api/me/links/${profileId}/reorder`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        links: [
          { id: link2Id, sort_order: 0 },
          { id: linkId, sort_order: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('400 - 잘못된 UUID', async () => {
    const res = await request(app)
      .put(`/api/me/links/${profileId}/reorder`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        links: [{ id: 'not-uuid', sort_order: 0 }],
      });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/me/links/:profileId/:linkId', () => {
  it('200 - 링크 삭제', async () => {
    // 삭제용 링크 생성
    const createRes = await request(app)
      .post(`/api/me/links/${profileId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ label: 'To Delete', url: 'https://delete.me' });
    const deleteId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/me/links/${profileId}/${deleteId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
  });
});
