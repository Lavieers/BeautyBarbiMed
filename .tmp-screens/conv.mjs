import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const src = 'C:\\Users\\byluk\\.cursor\\projects\\c-Users-byluk-Desktop-BeautyBarbiMed\\assets\\c__Users_byluk_AppData_Roaming_Cursor_User_workspaceStorage_ac35d8b3161fd2af7e34ee97db088672_images_wedding-70dbe2f4-89f4-46e4-812b-0789745abe85.jpg'
const b64 = fs.readFileSync(src).toString('base64')
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true })
const page = await browser.newPage()
await page.setContent('<body></body>')
const out = await page.evaluate(async (b64) => {
  const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode()
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
  c.getContext('2d').drawImage(img, 0, 0)
  return { w: c.width, h: c.height, data: c.toDataURL('image/webp', 0.82).split(',')[1] }
}, b64)
fs.writeFileSync('src/assets/panny-mlodej.webp', Buffer.from(out.data, 'base64'))
console.log(out.w, out.h, fs.statSync('src/assets/panny-mlodej.webp').size)
await browser.close()
