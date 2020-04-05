const mqtt = require('mqtt')
const config = require('config')
const parser = require('node-html-parser').parse
const getHTML = require('./getHTML')
const fileUtils = require('../utils')

const MQTT_URL = process.env.MQTT_URL || (config.mqtt || {}).host || "mqtt://localhost:1883"

const client = mqtt.connect(MQTT_URL)

client.on('connect', ()=>{
    console.log('Lazada crawler connected')

    client.subscribe('crawler/lazada', (err)=>{
        if (err) {
            console.log('Subscribe to lazada channel failed')
        } else {
            client.on('message', (topic, message) => {
                let parsedMessage = JSON.parse(message.toString())
                try {
                    crawl(parsedMessage.id, parsedMessage.url)
                } catch (e) {
                    console.log("Error:", e.message)
                }
            })
        }
    })
})


async function crawl(id, url) {
    // do crawl
    let html = await getHTML(url)
    html = parser(html)
    
    let title = html.querySelectorAll('.pdp-mod-product-badge-title')[0].rawText
    let price = html.querySelectorAll('.pdp-price_type_normal')[0].rawText
    let description =  html.querySelectorAll('.detail-content')[0].rawText


    fileUtils.write(id, JSON.stringify({
        id: id,
        title: title,
        price: price,
        description: description
    }))
    // nothing
}