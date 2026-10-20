import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const page = await browser.newPage()
page.on('framenavigated', f => console.log('NAV', f.url()))
page.on('console', m => console.log('console', m.text()))
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await sleep(1000)
await page.evaluate(() => document.querySelector('.pricing button').scrollIntoView({block:'center'}))
await sleep(500)
await page.evaluate(() => document.querySelector('.pricing button').click())
await sleep(900)
await page.evaluate(() => { for (const t of ['click','touchstart','touchend','keydown']) document.addEventListener(t, e => console.log(t, e.target.className||e.target.tagName, e.clientX), true) })
const swipe = async (x1, y1, x2, y2) => { await page.touchscreen.touchStart(x1, y1); await page.touchscreen.touchMove((x1+x2)/2, (y1+y2)/2); await page.touchscreen.touchMove(x2, y2); await page.touchscreen.touchEnd(); await sleep(800) }
await swipe(120, 600, 340, 610)
console.log('closed?', await page.evaluate(() => !document.querySelector('.package-modal')))
await browser.close()
