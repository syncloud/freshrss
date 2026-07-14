import { Page, TestInfo } from '@playwright/test'
import { shoot } from './screenshot'

const onAuthHost = (page: Page) => {
  try { return new URL(page.url()).host.startsWith('auth.') } catch { return false }
}

export async function loginViaSyncloud (
  page: Page,
  baseURL: string,
  username: string,
  password: string,
  info?: TestInfo
) {
  await page.goto(baseURL)
  await page.waitForLoadState('networkidle').catch(() => {})
  if (info) await shoot(page, info, 'landing')

  if (!onAuthHost(page)) {
    const signIn = page
      .getByRole('button', { name: /sign in|log ?in/i })
      .or(page.getByRole('link', { name: /sign in|log ?in/i }))
      .first()
    if (await signIn.isVisible().catch(() => false)) {
      await Promise.all([
        page.waitForURL((url) => new URL(url.toString()).host.startsWith('auth.'), { timeout: 30_000 }).catch(() => {}),
        signIn.click()
      ])
      await page.waitForLoadState('networkidle').catch(() => {})
    }
  }

  if (onAuthHost(page)) {
    const userSel = 'input[name="username"], input#username-textfield, input[autocomplete="username"], input[type="text"]'
    const passSel = 'input[name="password"], input#password-textfield, input[autocomplete="current-password"], input[type="password"]'
    const submitSel = 'button#sign-in-button, button[type="submit"], button:has-text("Sign in"), button:has-text("Login")'

    await page.locator(userSel).first().waitFor({ state: 'visible', timeout: 20_000 })
    await page.locator(userSel).first().fill(username)
    await page.locator(passSel).first().fill(password)
    if (info) await shoot(page, info, 'auth')
    await Promise.all([
      page.waitForURL((url) => !new URL(url.toString()).host.startsWith('auth.'), { timeout: 30_000 }).catch(() => {}),
      page.locator(submitSel).first().click()
    ])
    await page.waitForLoadState('networkidle').catch(() => {})
  }

  await page.locator('#stream, #global').first().waitFor({ state: 'visible', timeout: 45_000 })
}
