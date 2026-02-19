import { test, expect } from '@playwright/test';
import { signupUser } from '../helpers/test-user';

test.describe('링크 관리', () => {
  test.beforeEach(async ({ page }) => {
    await signupUser(page);
    await page.getByRole('link', { name: '링크' }).click();
    await page.waitForURL(/\/dashboard\/links/);
    // 페이지 로딩 완료 대기
    await expect(page.getByText('링크 관리')).toBeVisible({ timeout: 5000 });
    // fetchProfiles → fetchLinks 완료 대기 (loading 상태 안정화)
    await page.waitForLoadState('networkidle');
  });

  async function addLink(page: any, label: string, url: string) {
    // 링크 추가 또는 첫 번째 링크 추가 버튼
    const addButton = page.getByRole('button', { name: '링크 추가', exact: true });
    const firstAddButton = page.getByRole('button', { name: '첫 번째 링크 추가' });

    if (await firstAddButton.isVisible().catch(() => false)) {
      await firstAddButton.click();
    } else {
      await addButton.click();
    }

    // 입력 필드가 보일 때까지 대기 후 데이터 입력 (CSS selector 사용)
    const titleInput = page.locator('input[placeholder="링크 제목"]');
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.click();
    await titleInput.fill(label);

    const urlInput = page.locator('input[placeholder="https://example.com"]');
    await urlInput.click();
    await urlInput.fill(url);

    // 저장 버튼이 활성화될 때까지 대기
    const saveBtn = page.getByRole('button', { name: '저장', exact: true });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });

    // API 응답 대기와 함께 저장
    await Promise.all([
      page.waitForResponse((res: any) => res.url().includes('/api/me/links') && res.status() === 201),
      saveBtn.click(),
    ]);

    // 폼이 닫힐 때까지 대기
    await expect(titleInput).not.toBeVisible({ timeout: 5000 });
  }

  test('링크 추가', async ({ page }) => {
    await addLink(page, 'My Blog', 'https://myblog.com');
    await expect(page.getByText('My Blog')).toBeVisible({ timeout: 5000 });
  });

  test('링크 수정', async ({ page }) => {
    await addLink(page, 'Original', 'https://original.com');
    await expect(page.getByText('Original', { exact: true })).toBeVisible({ timeout: 5000 });

    // 편집 버튼
    await page.locator('button:has(svg.lucide-pencil)').click();

    const titleInput = page.locator('input[placeholder="링크 제목"]');
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.clear();
    await titleInput.fill('Updated');

    const saveBtn = page.getByRole('button', { name: '저장', exact: true });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });

    await Promise.all([
      page.waitForResponse((res: any) => res.url().includes('/api/me/links') && res.status() === 200),
      saveBtn.click(),
    ]);

    await expect(page.getByText('Updated')).toBeVisible({ timeout: 5000 });
  });

  test('링크 삭제', async ({ page }) => {
    await addLink(page, 'To Delete', 'https://delete.me');
    await expect(page.getByText('To Delete')).toBeVisible({ timeout: 5000 });

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('button:has(svg.lucide-trash2)').click();
    await expect(page.getByText('To Delete')).not.toBeVisible({ timeout: 5000 });
  });

  test('링크 활성/비활성 토글', async ({ page }) => {
    await addLink(page, 'Toggle Test', 'https://toggle.com');
    await expect(page.getByText('Toggle Test')).toBeVisible({ timeout: 5000 });

    const toggle = page.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await page.waitForTimeout(1000);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});
