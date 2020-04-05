const config = require('config')
const pino = require('express-pino-logger')
const uuid = require('uuid').v4
const mqtt = require('mqtt')
const fileUtils = require('../utils')


const APP_PORT = process.env.REST_API_PORT || (config.restAPI || {}).port || 3998
const MQTT_URL = process.env.MQTT_URL || (config.mqtt || {}).host || "mqtt://localhost:1883"

const client = mqtt.connect(MQTT_URL)

client.on('connect', ()=>{
    console.log('Mqtt connected')
})

const express = require('express')

const app = express()

app.use(require('body-parser').json())
app.use(require('cors')())
// app.use(pino)

app.post('/crawl', async (req, res)=>{
    let url = req.body.url
    doCrawl(url)
    .then((rs)=>{
        res.json({
            id: rs
        })
    })
    .catch(e => {
        res.status(500).json({error: e.message})
    })
})

app.get('/jobs/:id', async (req, res)=>{
    let id = req.params.id
    if (fileUtils.checkIfExist(id)) {
        res.json(fileUtils.getFileContent(id))
    } else {
        res.json({
            error: "No job found"
        })
    }
})

async function doCrawl(url) {
    let id = uuid()
    if (url.includes('lazada.vn')) {
        fileUtils.initFile(id, 'LAZADA')
        client.publish('crawler/lazada', JSON.stringify({url: url, id: id}))
    } else if (url.includes('tiki.vn')) {
        fileUtils.initFile(id, 'TIKI')
        client.publish('crawler/tiki', JSON.stringify({url: url, id: id}))
    } else if (url.includes('shopee.vn')) {
        fileUtils.initFile(id, 'SHOPEE')
        client.publish('crawler/shopee', JSON.stringify({url: url, id: id}))
    } else throw new Error("No crawler for this type of url")
   
    return id
}


app.listen(APP_PORT, ()=>{
    console.log('API service running on', APP_PORT)
})