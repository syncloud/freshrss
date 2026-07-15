import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'
import { env } from '../helpers/env'

const baseURL = `https://freshrss.${env('PLAYWRIGHT_DOMAIN')}`
const username = env('PLAYWRIGHT_USER')
const password = env('PLAYWRIGHT_PASSWORD')
const feedUrl = 'https://www.freshrss.org/feeds/all.atom.xml'

test('feed', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'feed reading is desktop-only in this smoke test')

  await loginViaSyncloud(page, baseURL, username, password, info)

  await page.locator('#btn-add').click()
  await page.locator('#url_rss').fill(feedUrl)
  await page.locator('#add_rss button[type="submit"]').first().click()
  await page.waitForLoadState('networkidle').catch(() => {})

  await page.goto(`${baseURL}/i/?state=3`)
  const article = page.locator('#stream .flux').first()
  await expect(article).toBeVisible({ timeout: 30_000 })
  await shoot(page, info, 'articles')

  await article.locator('.summary').first().click()
  await expect(article.locator('.flux_content').first()).toBeVisible({ timeout: 10_000 })
  await shoot(page, info, 'article')
})
