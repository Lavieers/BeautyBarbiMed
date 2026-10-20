import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await sleep(1000)
const measure = async (label) => {
  await sleep(900)
  const r = await page.evaluate(() => { const m = document.querySelector('.package-modal--treatment .package-modal__media'); const p = document.querySelector('.package-modal--treatment'); return m && { media: Math.round(m.getBoundingClientRect().height), modal: Math.round(p.getBoundingClientRect().height) } })
  console.log(label, r)
  await page.screenshot({ path: `.tmp-screens/tm-${label}.png` })
  await page.keyboard.press('Escape'); await sleep(600)
}
await page.evaluate(() => document.querySelector('.pricing button').scrollIntoView({block:'center'}))
await sleep(500)
await page.evaluate(() => document.querySelector('.pricing button').click())
await measure('pricing')
await page.evaluate(() => document.querySelector('.skin-guide__card-footer .btn--secondary, .skin-guide__card-footer button:last-child').scrollIntoView({block:'center'}))
await sleep(500)
await page.evaluate(() => [...document.querySelectorAll('.skin-guide__card-footer button')].pop().click())
await measure('guide')
await browser.close()
