const puppeteer = require('puppeteer');

const chromeExec = __dirname + '/chrome-win/chrome.exe'

const config = require('config')

const APP_PORT = process.env.RENDERER_PORT || (config.renderer || {}).port || 3999

const express = require('express')

const app = express()

app.use(require('body-parser').json())
app.use(require('cors')())

app.post('/render', async (req, res)=>{
    let url = req.body.url
    //console.log('RENDER RECEIVED:', url)
    doRender(url).then((result)=>{
        res.send(result)
    }).catch(e=>{
        res.status(500).send(e.message)
    })
})

async function doRender(url) {
    let browser = await puppeteer.launch({executablePath: chromeExec, headless: false})
    let page = await browser.newPage()
    await page.goto(url, {waitUntil: 'networkidle0'})
    let content = await page.content()
    await page.close()
    await browser.close()
    return content
}

app.listen(APP_PORT, ()=>{
    console.log('Render service running on', APP_PORT)
})