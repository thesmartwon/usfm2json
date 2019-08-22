import { Lexer } from './lexer';
// Pratt parser

class Parser {
	constructor(input) {
		this.lexer = new Lexer(input)
		this._nuds = new Map()
		this._leds = new Map()
		this._bps = new Map()
	}

	bp(token) {
		return BPS[token.type] || 0
	}

	parse(rbp = 0) {
		let left = this.nud(this.lexer.next())
		while (this.bp(this.lexer.peek()) > rbp) {
			left = this.led(left, this.lexer.next())
		}
		return left
	}
}

export class ParserBuilder {
	constructor(parser) {
		this._parser = parser
	}

	nud(tokenType, bp, fn) {
		this._parser._nuds.set(tokenType, fn)
		this.bp(tokenType, bp)
		return this
	}

	led(tokenType, bp, fn) {
		this._parser._leds.set(tokenType, fn)
		this.bp(tokenType, bp)
		return this
	}

	either(tokenType, bp, fn) {
		return this.nud(tokenType, bp, inf =>
			fn(Object.assign(inf, {left: null}))
		).led(tokenType, bp, fn)
	}

	bp(tokenType, bp) {
		this._parser._bps.set(tokenType, bp)
		return this
	}

	build() {
		return this._parser
	}
}