const { Lexer } = require('./lexer')

class Parser {
	constructor(expr) {
		this.lexer = new Lexer(expr)
		this.token = this.getToken()
	}

	// This function is genius
	parse(rbp = 0) {
		let prevtoken = this.token
		this.token = this.getToken() // Continue to next token
		let left = prevtoken.nud() // Evaluate previous token
		while (rbp < this.token.lbp) { // Whether to nud or led
			prevtoken = this.token
			this.token = this.getToken()
			left = prevtoken.led(left) // Recursively evaluate left
		}
	
		return left
	}

	NumberToken(val) {
		return { nud: () => val }
	}

	PlusToken() {
		return {
			lbp: 10,
			nud: () => this.parse(100),
			led: left => {
				const right = this.parse(10)
				return left + right
			}
		}
	}

	MinusToken() {
		return {
			lbp: 10,
			nud: () => -this.parse(100),
			led: left => {
				const right = this.parse(10)
				return left - right
			}
		}
	}

	MultToken() {
		return {
			lbp: 20,
			led: left => left * this.parse(20)
		}
	}

	ParenToken() {
		return {
			lbp: 0,
			nud: () => {
				const res = this.parse()
				expect(')')
			}
		}
	}

	getToken() {
		const next = this.lexer.next()
		if (next === 'EOF') {
			return { lbp: 0 }
		}

		if (next.type === 'NUMBER') {
			return this.NumberToken(+next.value);
		} else if (next.type === 'OPERATOR') {
			if (next.value === '+') {
				return this.PlusToken()
			} else if (next.value === '-') {
				return this.MinusToken()
			} else if (next.value === '*') {
				return this.MultToken()
			}
		}

		throw new Error(next)
	}
}

const parser = new Parser('-15 + 5 * 6')
console.log('hooray?', parser.parse())
