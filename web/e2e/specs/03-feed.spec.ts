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

  // add a feed the way a user does on an empty system: the + button, paste a URL, submit
  await page.locator('#btn-add').click()
  await page.locator('#url_rss').fill(feedUrl)
  await page.locator('#add_rss button[type="submit"]').first().click()
  await page.waitForLoadState('networkidle').catch(() => {})
  await shoot(page, info, 'added')

  // adding a feed fetches its entries, so the reader now shows real articles
  await expect(async () => {
    await page.goto(baseURL)
    await expect(page.locator('#stream .flux').first()).toBeVisible({ timeout: 8_000 })
  }).toPass({ timeout: 90_000, intervals: [3_000, 5_000, 8_000] })

  await shoot(page, info, 'feed')
})
