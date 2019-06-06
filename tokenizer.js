const assert = require('assert')
// https://regex101.com/r/QdpT2h/8
const regex = /([^\\]*)\\([a-zA-Z-+]+)\s*([\d-]*)\s*([^\\|]*)\|?\s*([^\\]*)(?:\\\w?\*)?([^\\]*)/g

const processLine = (line, tokens) => {
	let regMatch
	while (regMatch = regex.exec(line)) {
		if (regMatch[1]) tokens.push({ tag: 'orphan', text: regMatch[1] })
		
		const token = { tag: regMatch[2] }
		
		if (regMatch[3]) {
			if (token.tag === 'c') {
				assert(!isNaN(regMatch[3]), `chapter ${regMatch[3]} must contain valid number`)
				token.num = +regMatch[3]
			}
			else token.num = regMatch[3]
		}
		if (regMatch[4]) token.text = regMatch[4]
		if (regMatch[5]) token.attributes = regMatch[5]

		tokens.push(token)

		if (regMatch[6]) tokens.push({ tag: 'orphan', text: regMatch[1]	})
	}
}

module.exports = {
	processLine
}

