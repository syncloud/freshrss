import { test, expect } from '@playwright/test'
import { shoot } from '../helpers/screenshot'
import { loginViaSyncloud } from '../helpers/auth'
import { env } from '../helpers/env'

const baseURL = `https://freshrss.${env('PLAYWRIGHT_DOMAIN')}`
const username = env('PLAYWRIGHT_USER')
const password = env('PLAYWRIGHT_PASSWORD')

test('login', async ({ page }, info) => {
  await loginViaSyncloud(page, baseURL, username, password, info)

  await expect(page.locator('#stream')).toBeVisible({ timeout: 45_000 })
  await shoot(page, info, 'reader')
})
