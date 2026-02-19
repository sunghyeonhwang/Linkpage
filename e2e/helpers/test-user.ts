import { Page } from '@playwright/test';

const TEST_PREFIX = `e2e_${Date.now()}`;
let counter = 0;

export function uniqueTestEmail(): string {
  return `${TEST_PREFIX}_${counter++}@test.com`;
}

export const TEST_PASSWORD = 'test12345';

export async function signupUser(page: Page, email?: string): Promise<{ email: string; password: string }> {
  const userEmail = email || uniqueTestEmail();
  await page.goto('/signup');
  await page.getByPlaceholder('email@example.com').fill(userEmail);
  // 비밀번호 필드들 — placeholder로 구분
  const passwordFields = page.getByPlaceholder('8자 이상');
  await passwordFields.fill(TEST_PASSWORD);
  await page.getByPlaceholder('비밀번호를 다시 입력해주세요').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: '회원가입' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  return { email: userEmail, password: TEST_PASSWORD };
}

export async function loginUser(page: Page, email: string, password: string = TEST_PASSWORD) {
  await page.goto('/login');
  await page.getByPlaceholder('email@example.com').fill(email);
  await page.getByPlaceholder('8자 이상').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}
