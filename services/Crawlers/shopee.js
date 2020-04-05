const mqtt = require('mqtt')
const config = require('config')
const parser = require('node-html-parser').parse
const getHTML = require('./getHTML')
const fileUtils = require('../utils')

const MQTT_URL = process.env.MQTT_URL || (config.mqtt || {}).host || "mqtt://localhost:1883"

const client = mqtt.connect(MQTT_URL)

client.on('connect', ()=>{
    console.log('Shopee crawler connected')

    client.subscribe('crawler/shopee', (err)=>{
        if (err) {
            console.log('Subscribe to shopee channel failed')
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
    //console.log(html.querySelectorAll('.qaNIZv'))
    let title = html.querySelectorAll('.qaNIZv')[0].childNodes[1].rawText
    let price = html.querySelectorAll('._3n5NQx')[0].rawText
    let description =  html.querySelectorAll('._2u0jt9')[0].childNodes[0].rawText

    fileUtils.write(id, JSON.stringify({
        id: id,
        title: title,
        price: price,
        description: description
    }))
}