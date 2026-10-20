import puppeteer from 'puppeteer-core'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: edge, headless: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
for (const [name, vp] of [['desk', {width:1440,height:900}], ['mob', {width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}]]) {
  const page = await browser.newPage()
  await page.setViewport(vp)
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
  await sleep(1000)
  const tabs = await page.$$('.offer__tab')
  console.log(name, 'tabs', tabs.length)
  for (let i = 0; i < tabs.length; i++) {
    await page.evaluate((i) => document.querySelectorAll('.offer__tab')[i].click(), i)
    await sleep(700)
    await page.evaluate(() => document.querySelector('.offer__carousel-wrap').scrollIntoView())
    await sleep(500)
    const info = await page.evaluate(() => [...document.querySelectorAll('.offer__package')].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }))
    console.log(name, i, JSON.stringify(info))
    const el = await page.$('.offer__carousel-wrap')
    await el.screenshot({ path: `.tmp-screens/offer-${name}-${i}.png` })
  }
  await page.close()
}
await browser.close()
