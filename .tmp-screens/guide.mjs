import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await sleep(1000)
await page.evaluate(() => document.querySelector('.skin-guide__tabs').scrollIntoView())
await sleep(800)
for (const i of [3, 0]) {
  await page.evaluate((i) => document.querySelectorAll('.skin-guide__tab')[i].click(), i)
  await sleep(1500)
  const r = await page.evaluate(() => ({ y: window.scrollY, top: Math.round(document.querySelector('.skin-guide__display').getBoundingClientRect().top) }))
  console.log(i, r)
  await page.screenshot({ path: `.tmp-screens/guide-${i}.png` })
}
await browser.close()
