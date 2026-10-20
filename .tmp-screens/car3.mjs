import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await sleep(800)
await page.evaluate(() => document.querySelector('#oferta').scrollIntoView())
await sleep(800)
const log = []
await page.exposeFunction('rec', (s) => log.push(s))
await page.evaluate(() => { const t=document.querySelector('.pkg-carousel__track'); const t0=performance.now(); t.addEventListener('scroll', () => window.rec(Math.round(performance.now()-t0) + ':' + Math.round(t.scrollLeft))) })
await page.touchscreen.touchStart(300, 480); await page.touchscreen.touchMove(180, 480); await page.touchscreen.touchMove(60, 480); await page.touchscreen.touchEnd(); await sleep(2000)
console.log(log.join(' '))
await browser.close()
