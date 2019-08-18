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

	next() {
		if (this.position === this.input.length)
			return 'EOF'

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const match = token.regex.exec(this.input.substr(this.position))
			if (match) {
				this.position += match[0].length
				if (token.skip) return null
				return {
					type: token.type,
					...(match[1] && { typeName: match[1].toLocaleUpperCase() }),
					position: this.position,
					...(token.type === 'TEXT' && { text: match[0] })
				}
			}
		}

		const { line, column, context } = Lexer.strPos(this.input, this.position)

		throw new Error(`No token found at line ${line}:${column}\n${context}`)
	}
}

module.exports = {
	Lexer
}
