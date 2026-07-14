import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'

const baseURL = `https://freshrss.${process.env.PLAYWRIGHT_DOMAIN || 'bookworm.com'}`
const username = process.env.PLAYWRIGHT_USER || 'user'
const password = process.env.PLAYWRIGHT_PASSWORD || 'Password1'

test('feed', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'feed sidebar is desktop-only in this smoke test')

  await loginViaSyncloud(page, baseURL, username, password, info)

  // the example feed seeded at install (DATA_PATH/opml.xml) shows in the sidebar tree
  await expect(page.locator('#sidebar').getByText('Example Feeds')).toBeVisible({ timeout: 20_000 })

  // and in subscription management
  await page.locator('#btn-subscription').click()
  await expect(page).toHaveURL(/subscription/, { timeout: 20_000 })
  await expect(page.getByText('Example Feeds')).toBeVisible()
  await shoot(page, info, 'feeds')
})
