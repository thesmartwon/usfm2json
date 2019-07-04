const assert = require('assert')
// https://regex101.com/r/QdpT2h/12
const regex = /([^\\]*)\\([a-zA-Z-+]+)\s*([\d-]*\s*)([^\\|]*)\|?\s*([^\\]*)(\\\w*\*)?([^\\]*)/g

const attributeRegex = /(?:x-)?(\w+)\s*=\s*"(\w+)"/g

const processLine = (line, tokens) => {
	let regMatch
	while (regMatch = regex.exec(line)) {
		const orphanStart = regMatch[1] && regMatch[1].trim()
		if (orphanStart) tokens.push({ tag: 'orphan', text: orphanStart })
		
		const token = { tag: regMatch[2] }
		
		if (regMatch[3]) {
			if (token.tag === 'c') {
				assert(!isNaN(regMatch[3]), `chapter ${regMatch[3]} must contain valid number`)
				token.num = +regMatch[3]
			}
			else token.num = regMatch[3]
		}
		if (regMatch[4]) token.text = regMatch[4]
		if (regMatch[5]) {
			token.attributes = {}
			let attributeMatch
			while (attributeMatch = attributeRegex.exec(regMatch[5])) {
				token.attributes[attributeMatch[1]] = attributeMatch[2]
			}
		}

		tokens.push(token)

		const orphanEnd = regMatch[7] && regMatch[7].trim()
		if (orphanEnd) tokens.push({ tag: 'orphan', text: orphanEnd })
	}
}

module.exports = {
	processLine
}

