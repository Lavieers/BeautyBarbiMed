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
const act = () => page.evaluate(() => [...document.querySelectorAll('.pkg-card')].findIndex(c => c.classList.contains('pkg-card--active')) + '/' + document.querySelectorAll('.pkg-card').length)
console.log('initial', await act())
await page.screenshot({ path: '.tmp-screens/car-0.png' })
await sleep(5200); console.log('after 5s', await act())
await sleep(4800); console.log('after 10s', await act())
await sleep(4800); console.log('after 15s (wraps?)', await act())
await page.screenshot({ path: '.tmp-screens/car-1.png' })
// swipe by user pauses
const sw = async (x1, x2) => { await page.touchscreen.touchStart(x1, 500); await page.touchscreen.touchMove((x1+x2)/2, 500); await page.touchscreen.touchMove(x2, 500); await page.touchscreen.touchEnd(); await sleep(900) }
await sw(300, 80); console.log('after swipe', await act())
await sleep(5200); console.log('paused after touch (same)', await act())
// tab with 2 packages
await page.evaluate(() => document.querySelectorAll('.offer__tab')[4].click()); await sleep(900)
console.log('tab5', await act())
// open modal via card
await page.evaluate(() => document.querySelector('.pkg-card--active .pkg-card__inner').click()); await sleep(900)
const state = () => page.evaluate(() => (document.querySelector('.package-modal__title')?.textContent ?? 'CLOSED') + ' | ' + document.querySelector('.package-modal__nav span')?.textContent)
console.log('modal', await state())
await page.screenshot({ path: '.tmp-screens/car-modal.png' })
await page.touchscreen.touchStart(300, 600); await page.touchscreen.touchMove(200, 600); await page.touchscreen.touchMove(80, 605); await page.touchscreen.touchEnd(); await sleep(900)
console.log('modal after swipe', await state())
console.log('errors', errs)
await browser.close()
