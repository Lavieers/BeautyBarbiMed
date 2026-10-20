import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const page = await browser.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await sleep(1000)
await page.evaluate(() => document.querySelector('#oferta').scrollIntoView())
await sleep(1200)
const act = () => page.evaluate(() => { const c=[...document.querySelectorAll('.pkg-card')]; const g=c.findIndex(x=>x.classList.contains('pkg-card--active')); return g + '/' + c.length + ' dot=' + [...document.querySelectorAll('.pkg-carousel__dot')].findIndex(d=>d.classList.contains('pkg-carousel__dot--active')) + ' scrollLeft=' + Math.round(document.querySelector('.pkg-carousel__track').scrollLeft) })
console.log('initial', await act())
await page.screenshot({ path: '.tmp-screens/car2-0.png' })
for (let i = 0; i < 5; i++) { await sleep(4700); console.log('auto', i, await act()) }
await page.screenshot({ path: '.tmp-screens/car2-1.png' })
const sw = async (x1, x2) => { await page.touchscreen.touchStart(x1, 480); await page.touchscreen.touchMove((x1+x2)/2, 480); await page.touchscreen.touchMove(x2, 480); await page.touchscreen.touchEnd(); await sleep(1000) }
for (let i = 0; i < 4; i++) { await sw(300, 60); console.log('swipe left', i, await act()) }
for (let i = 0; i < 4; i++) { await sw(60, 300); console.log('swipe right', i, await act()) }
await page.evaluate(() => document.querySelector('.pkg-card--active .pkg-card__inner').click()); await sleep(900)
console.log('modal', await page.evaluate(() => document.querySelector('.package-modal__title')?.textContent ?? 'CLOSED'))
console.log('errors', errs)
await browser.close()
