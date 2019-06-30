const fs = require('fs')
const { processLine } = require('./tokenizer')
const { renderTokens } = require('./renderer')
const { postRender } = require('./postrender')

const usfm2json = usfmText => {
	let tokens = []

	usfmText.split('\n').forEach(line => processLine(line, tokens))
	return postRender(renderTokens(tokens))
}

module.exports = { usfm2json }

