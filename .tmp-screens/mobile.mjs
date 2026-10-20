import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const page = await browser.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await sleep(1200)
console.log('mobile-bar in DOM:', !!(await page.$('.mobile-bar')))
await page.screenshot({ path: '.tmp-screens/mobile-top.png' })
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(800)
await page.screenshot({ path: '.tmp-screens/mobile-bottom.png' })
console.log('errors:', errs)
await browser.close()
