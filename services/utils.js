const fs = require('fs')
let folder = './files/'

function checkIfExist(id) {
    let file = folder + id + '.txt'
    return fs.existsSync(file)
}

function write(id, content) {
    let file = folder + id + '.txt'
    fs.writeFileSync(file, content)
}

function initFile(id, type) {
    let file = folder + id + '.txt'
    fs.writeFileSync(file, JSON.stringify({
        id: id,
        type: type,
        status: 'Pending'
    }))
}


function getFileContent(id) {
    let file = folder + id + '.txt'
    let content = fs.readFileSync(file)
    return JSON.parse(content.toString())
}

module.exports = {
    checkIfExist,
    write,
    initFile,
    getFileContent
}