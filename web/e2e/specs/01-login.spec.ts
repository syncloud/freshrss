import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'

const baseURL = `https://freshrss.${process.env.PLAYWRIGHT_DOMAIN || 'bookworm.com'}`
const username = process.env.PLAYWRIGHT_USER || 'user'
const password = process.env.PLAYWRIGHT_PASSWORD || 'Password1'

test('logs in via Syncloud SSO and lands in the FreshRSS reader', async ({ page }, info) => {
  await loginViaSyncloud(page, baseURL, username, password, info)

  await expect(page.locator('#stream')).toBeVisible({ timeout: 45_000 })
  await expect(page).toHaveTitle(/FreshRSS/i)
  await shoot(page, info, 'reader')
})
