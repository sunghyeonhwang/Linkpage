import { test, expect } from '@playwright/test';
import { signupUser, loginUser, uniqueTestEmail, TEST_PASSWORD } from '../helpers/test-user';

test.describe('인증 플로우', () => {
  test('회원가입 → 대시보드 리다이렉트', async ({ page }) => {
    await signupUser(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('회원가입이 완료되었습니다')).toBeVisible({ timeout: 5000 });
  });

  test('로그인 성공 → 대시보드 이동', async ({ page }) => {
    const { email } = await signupUser(page);
    await page.getByText('로그아웃').click();
    await page.waitForURL(/\/login/);
    await loginUser(page, email);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('로그인 실패 — 잘못된 비밀번호', async ({ page }) => {
    const { email } = await signupUser(page);
    await page.getByText('로그아웃').click();
    await page.waitForURL(/\/login/);

    await page.getByPlaceholder('email@example.com').fill(email);
    await page.getByPlaceholder('8자 이상').fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    // 로그인이 실패하면 여전히 로그인 페이지에 있어야 함
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('미인증 상태에서 대시보드 접근 → 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('인증 상태에서 /login 접근 → 대시보드 리다이렉트', async ({ page }) => {
    await signupUser(page);
    await page.goto('/login');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('로그아웃 → 로그인 페이지 이동', async ({ page }) => {
    await signupUser(page);
    await page.getByText('로그아웃').click();
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
