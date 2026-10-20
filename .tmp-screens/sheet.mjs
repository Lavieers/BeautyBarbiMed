import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const names = ['guide-diament','guide-suchosc','guide-mezo','guide-rf','guide-maska','rzesy-krysztalki','rzesy-mokry-efekt','rzesy-naturalne','guide-rzesy','salon','hero','okazja-tulipany','gabinet-wnetrze','guide-biopen','zabieg-biopen','biopen-produkt']
const html = '<body style="margin:0;display:grid;grid-template-columns:repeat(4,300px);gap:6px;font:14px sans-serif">' + names.map(n => `<div><img src="data:image/webp;base64,${fs.readFileSync('src/assets/'+n+'.webp').toString('base64')}" style="width:300px;height:220px;object-fit:cover"><br>${n}</div>`).join('')
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true })
const page = await browser.newPage(); await page.setViewport({width:1230,height:1000})
await page.setContent(html); await new Promise(r=>setTimeout(r,800))
await page.screenshot({ path: '.tmp-screens/sheet.png', fullPage: true }); await browser.close()
