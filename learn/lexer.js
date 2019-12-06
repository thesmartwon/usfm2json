const tokens = [
	{ type: 'WHITESPACE', regex: /^\s+/, skip: true },
	{ type: 'NUMBER', regex: /^(\d+)/ },
	{ type: 'OPERATOR', regex: /^([+-\/*^\(\)])/ },
]


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
				if (token.skip) continue
				return {
					position: this.position,
					type: token.type,
					value: match[1]
				}
			}
		}

		const { line, column, context } = Lexer.strPos(this.input, this.position)

		throw new Error(`No token found at line ${line}:${column}\n${context}`)
	}

	expect(type) {
		const next = this.next();
		const { line, column, context } = Lexer.strPos(this.input, this.position)
		if (next.type !== type)
			throw new Error(`Unexpected token ${next.type}. Expected ${type} at  line ${line}:${column}\n${context}`)
	}
}

module.exports = {
	Lexer
}
