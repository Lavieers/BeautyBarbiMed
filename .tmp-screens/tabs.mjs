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
const tabs = await page.$$('.offer__tab')
for (let i = 0; i < tabs.length; i++) {
  await page.evaluate((i) => document.querySelectorAll('.offer__tab')[i].click(), i)
  await sleep(900)
  const imgs = await page.evaluate(() => [...document.querySelectorAll('.pkg-card')].slice(0, 3).map(c => c.querySelector('img').src.split('/').pop().split('?')[0]))
  const geo = await page.evaluate(() => { const t = document.querySelector('.pkg-carousel__track'); const c = document.querySelector('.pkg-card'); const r = c.getBoundingClientRect(); return { n: document.querySelectorAll('.pkg-card').length, left: Math.round(r.left), right: Math.round(window.innerWidth - r.right), scrollLeft: t.scrollLeft, sw: t.scrollWidth, cw: t.clientWidth } })
  console.log(i, JSON.stringify(imgs), JSON.stringify(geo))
  await page.evaluate(() => document.querySelector('.offer__carousel-wrap').scrollIntoView())
  if (i === 5 || i === 4) { await sleep(300); await page.screenshot({ path: `.tmp-screens/tab-${i}.png` }) }
}
await browser.close()
