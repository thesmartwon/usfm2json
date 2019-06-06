const { processLine } = require('./tokenizer')
const { renderTokens } = require('./renderer')

let tokens = []

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(chunk) {
    chunk.split("\n").forEach(line => processLine(line, tokens))
})
process.stdin.on('end', function() {
    console.log(JSON.stringify(renderTokens(tokens), null, 2))
})

