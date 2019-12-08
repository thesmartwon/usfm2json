// https://ubsicap.github.io/usfm/identification/index.html
const tokens = [
	{ type: 'WHITESPACE', regex: /^\s+/, skip: true },
	{ type: 'TEXT', regex: /^[^\\\r\n]+/ },
	{ type: 'TAG_END', regex: /^\\([\w-]*\*)\s*/ },
	{ type: 'TAG', regex: /^\\([\w-]*)\s*/ },
]

/*
 * In: \id ROM EN_ULT en_English_ltr Thu Jun 13 2019 11:22:37 GMT-0400 (EDT) tc 
 * Out: { type: 'TAG_ID', position: 4 }
 * 			{ type: 'TEXT',
 * 			  position: 72,
 * 			  text: 'ROM EN_ULT en_English_ltr Thu Jun 13 2019 11:22:37 GMT-0400 (EDT) tc' }
 */
class Lexer {
	constructor(input) {
		this.input = input
		this.position = 0
	}

	static strPos(str, pos) {
		const endPos = str.indexOf("\n", pos)
		const lines = str.substr(0, endPos !== -1 ? endPos : str.length).split(/\n/)

		const line = lines.length
		const column = pos + 1 - lines
			.slice(0, -1)
			.reduce((sum, cur) => sum += cur.length + 1, 0)

		return {
			line,
			column,
			context: `${lines[lines.length - 1]}\n${Array(column).join(" ")}^`
		}
	}

	static getTokenNum(token) {
		const match = /\d+/.exec(token.type)
		return match ? Number.parseInt(match[1]) : null
	}

	static getTokenAttributes(token, attributeStr) {
		const res = {}
		if (token.type === 'TEXT' && attributeStr) {
			const re = /(?:x-)?(.+)="(.+)"/
			attributeStr
				.split(' ')
				.filter(Boolean)
				.map(attribute => re.exec(attribute))
				.filter(Boolean) // TODO: error check
				.forEach(match => res[match[1]] = match[2])
		}
		return res
	}

	getStrPosMessage(pos) {
		const { line, column, context } = Lexer.strPos(this.input, pos)

		return `${line}:${column}\n${context}`
	}

	next() {
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const match = token.regex.exec(this.input.substr(this.position))
			if (match) {
				this.position += match[0].length
				if (token.skip) continue
				const type = match[1]
					? match[1].toUpperCase().replace(/\d+/, '')
					: token.type
				const num = Lexer.getTokenNum(token)
				let attributes, text
				if (match[0]) {
					text = match[0]
					const listStart = text.indexOf('|')
					if (listStart >= 0) {
						attributes = Lexer.getTokenAttributes(token, text.substr(listStart + 1))
						text = text.substr(0, listStart)
					}
				}

				return {
					type,
					...(num && { num }),
					...(text && { text }),
					...(attributes && { attributes }),
					position: this.position,
				}
			}
			if (this.position === this.input.length)
				return 'EOF'
		}

		const { line, column, context } = Lexer.strPos(this.input, this.position)

		throw new Error(`No token found at line ${line}:${column}\n${context}`)
	}

	peek() {
		const pos = this.position
		const res = this.next()
		this.position = pos
		return res
	}
}

module.exports = {
	Lexer
}
