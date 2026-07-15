import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'
import { env } from '../helpers/env'

const baseURL = `https://freshrss.${env('PLAYWRIGHT_DOMAIN')}`
const username = env('PLAYWRIGHT_USER')
const password = env('PLAYWRIGHT_PASSWORD')
const feedUrl = 'https://github.com/FreshRSS/FreshRSS/releases.atom'

test('feed', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'feed management is desktop-only in this smoke test')

  await loginViaSyncloud(page, baseURL, username, password, info)

  // add a feed the way a user does on an empty system: + button, paste a URL, submit
  await page.locator('#btn-add').click()
  await page.locator('#url_rss').fill(feedUrl)
  await page.locator('#add_rss button[type="submit"]').first().click()
  await page.waitForLoadState('networkidle').catch(() => {})
  await shoot(page, info, 'added')

  // it is now subscribed — open subscription management from the reader and see it listed
  await page.goto(baseURL)
  await page.locator('#btn-subscription').click()
  await expect(page.locator('.box').getByRole('link', { name: /freshrss/i }).first()).toBeVisible({ timeout: 20_000 })
  await shoot(page, info, 'feed')
})
