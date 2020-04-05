const mqtt = require('mqtt')
const config = require('config')
const parser = require('node-html-parser').parse
const getHTML = require('./getHTML')
const fileUtils = require('../utils')

const MQTT_URL = process.env.MQTT_URL || (config.mqtt || {}).host || "mqtt://localhost:1883"

const client = mqtt.connect(MQTT_URL)

client.on('connect', ()=>{
    console.log('Tiki crawler connected')

    client.subscribe('crawler/tiki', (err)=>{
        if (err) {
            console.log('Subscribe to tiki channel failed')
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
    let html = await getHTML(url)
    html = parser(html)
    
    let title = html.querySelectorAll('#product-name')[0].childNodes[5].rawText

    let price = html.querySelectorAll('#span-price')[0].rawText
    let description =  html.querySelectorAll('#gioi-thieu')[0].rawText

    fileUtils.write(id, JSON.stringify({
        id: id,
        title: title,
        price: price,
        description: description
    }))
}