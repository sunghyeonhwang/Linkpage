import { test, expect } from '@playwright/test';
import { signupUser } from '../helpers/test-user';

test.describe('공개 프로필 페이지', () => {
  test('공개 프로필 페이지에 프로필 정보가 표시된다', async ({ page }) => {
    await signupUser(page);

    const previewLink = page.getByText('미리보기');
    await expect(previewLink).toBeVisible({ timeout: 5000 });
    const href = await previewLink.getAttribute('href');
    const slug = href?.split('/p/')[1];
    expect(slug).toBeTruthy();

    await page.goto(`/p/${slug}`);
    await expect(page.getByText('Made with LinkPage')).toBeVisible({ timeout: 10000 });
  });

  test('미존재 슬러그 → 404 페이지', async ({ page }) => {
    await page.goto('/p/nonexistent-slug-xyz-99999');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 10000 });
  });
});
