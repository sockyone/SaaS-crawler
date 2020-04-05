const config = require('config')
const axios = require('axios')

const rendererURL = (process.env.RENDERER_HOST || (config.renderer || {}).host || "http://localhost") + ':' + (process.env.RENDERER_PORT || (config.renderer || {}).port || "3999")

console.log('rendererURL:', rendererURL)

module.exports = async function (url) {
    let res = await axios.post(rendererURL + '/render', {url: url})
    return res.data
}