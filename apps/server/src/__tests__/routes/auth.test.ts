import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { uniqueEmail, cleanupTestData, TEST_EMAIL_PREFIX } from '../helpers/setup.js';

beforeAll(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('POST /api/auth/signup', () => {
  it('201 - 회원가입 성공', async () => {
    const email = uniqueEmail();
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'test1234' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(email);
  });

  it('409 - 중복 이메일', async () => {
    const email = uniqueEmail();
    await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'test1234' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'test1234' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('400 - 잘못된 이메일 형식', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'invalid', password: 'test1234' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400 - 비밀번호 8자 미만', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: uniqueEmail(), password: '1234567' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  const loginEmail = `${TEST_EMAIL_PREFIX}_login@test.com`;

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: loginEmail, password: 'test1234' });
  });

  it('200 - 로그인 성공', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'test1234' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(loginEmail);
  });

  it('401 - 잘못된 비밀번호', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('401 - 미존재 이메일', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'test1234' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('200 - 인증된 사용자 정보 반환', async () => {
    const email = uniqueEmail();
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'test1234' });

    const token = signupRes.body.data.token;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it('401 - 토큰 없음', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 - 잘못된 토큰', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('200 - 로그아웃 성공 (stateless)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});
