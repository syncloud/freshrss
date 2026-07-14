import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'

const baseURL = `https://freshrss.${process.env.PLAYWRIGHT_DOMAIN || 'bookworm.com'}`
const username = process.env.PLAYWRIGHT_USER || 'user'
const password = process.env.PLAYWRIGHT_PASSWORD || 'Password1'

test('settings', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'header settings menu is desktop-only in this smoke test')

  await loginViaSyncloud(page, baseURL, username, password, info)

  await page.locator('a[href="#dropdown-configure"]').first().click().catch(() => {})
  const settingsLink = page.locator('a[href*="c=configure"]').first()
  await settingsLink.waitFor({ state: 'visible', timeout: 20_000 })
  await settingsLink.click()

  await expect(page).toHaveURL(/configure/, { timeout: 20_000 })
  await expect(page.locator('#global')).toBeVisible()
  await shoot(page, info, 'config')
})
