const fs = require('fs')
const { processLine } = require('./tokenizer')
const { renderTokens } = require('./renderer')
const { postRender } = require('./postrender')

let tokens = []
const book = fs.readFileSync(process.argv[2], 'utf8')

book.split('\n').forEach(line => processLine(line, tokens))

const json = postRender(renderTokens(tokens))
console.log(JSON.stringify(json, null, 2))

/* process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(chunk) {
    chunk.split("\n").forEach(line => processLine(line, tokens))
})
process.stdin.on('end', function() {
//    console.log(JSON.stringify(renderTokens(tokens), null, 2))
})*/

