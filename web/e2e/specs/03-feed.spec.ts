import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'
import { ssh } from '../helpers/ssh'

const baseURL = `https://freshrss.${process.env.PLAYWRIGHT_DOMAIN || 'bookworm.com'}`
const username = process.env.PLAYWRIGHT_USER || 'user'
const password = process.env.PLAYWRIGHT_PASSWORD || 'Password1'

test('feed', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'feed sidebar is desktop-only in this smoke test')

  await loginViaSyncloud(page, baseURL, username, password, info)

  // the example feed seeded at install (DATA_PATH/opml.xml) shows in the sidebar tree
  await expect(page.locator('#sidebar').getByText('Example Feeds')).toBeVisible({ timeout: 20_000 })

  // fetch the feed, then the reader should show real articles
  ssh('sudo -u freshrss /snap/freshrss/current/bin/freshrss.sh ./app/actualize_script.php 2>&1 | tail -3', { throw: false })

  await expect(async () => {
    await page.goto(baseURL)
    await expect(page.locator('#stream .flux').first()).toBeVisible({ timeout: 8_000 })
  }).toPass({ timeout: 90_000, intervals: [3_000, 5_000, 8_000] })

  await shoot(page, info, 'feeds')
})
