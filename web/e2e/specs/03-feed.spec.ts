import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'
import { env } from '../helpers/env'

const baseURL = `https://freshrss.${env('PLAYWRIGHT_DOMAIN')}`
const username = env('PLAYWRIGHT_USER')
const password = env('PLAYWRIGHT_PASSWORD')

test('feed', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'feed sidebar is desktop-only in this smoke test')

  await loginViaSyncloud(page, baseURL, username, password, info)

  // the example feed seeded at install (DATA_PATH/opml.xml) shows in the sidebar tree
  await expect(page.locator('#sidebar').getByText('Example Feeds')).toBeVisible({ timeout: 20_000 })

  // refresh feeds the way a user does — the header actualize button — then read the articles
  await page.locator('#actualize').click()
  await page.waitForLoadState('networkidle').catch(() => {})

  await expect(async () => {
    await page.goto(baseURL)
    await expect(page.locator('#stream .flux').first()).toBeVisible({ timeout: 8_000 })
  }).toPass({ timeout: 90_000, intervals: [3_000, 5_000, 8_000] })

  await shoot(page, info, 'feeds')
})
