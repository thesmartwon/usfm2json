const assert = require('assert')
const { Lexer } = require('./lexer')
const fs = require('fs')

class Parser {
	constructor(expr) {
		this.lexer = new Lexer(expr)
		this.chapters = []
	}

	assertTextAfter(token) {
		const next = this.lexer.next()
		if (next.type !== 'TEXT') {
			console.error('next', next)
			throw new Error(`Expected text after token ${token.type} at ${this.lexer.getStrPosMessage(token.position - 1)}`)
		}
		return next
	}

	assertClosingTag(token, prependTag = true) {
		const next = this.lexer.next()
		const expectedType = `${prependTag ? token.type : ''}*`
		if (next.type !== expectedType) {
			console.error('next', next)
			throw new Error(`Expected closing tag ${expectedType} for ${token.type}, not ${next.type} at ${this.lexer.getStrPosMessage(token.position - 1)}`)
		}
		return next
	}

	parse() {
		for (let i = this.lexer.next(); i != 'EOF'; i = this.lexer.next()) {
			console.log(i)
			let next
			switch(i.type) {
				// ID tags
				case 'ID':
					next = this.assertTextAfter(i)
					const split = next.text.split(' ')
					if (split[0].length !== 3) {
						throw new Error(`Expected 3-letter book code after ${token.type} at position ${token.position}`)
					}
					break
				case 'USFM':
				case 'IDE':
				case 'STS':
				case 'REM':
				case 'H':
				case 'TOC':
				case 'TOCA':
				// Introductions
				case 'IMT':
				case 'IS':
				case 'IP':
				case 'IPI':
				case 'IM':
				case 'IPQ':
				case 'IPR':
				case 'IB':
				case 'ILI':
				case 'IOT':
				case 'IO':
				case 'IEX':
				case 'IMTE':
				case 'IE':
					this.assertTextAfter(i)
					break
				case 'IOR':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				case 'IQT':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Titles, Headings, and Labels
				case 'MT':
				case 'MTE':
				case 'MS':
				case 'MR':
				case 'SR':
				case 'R':
				case 'D':
				case 'SP':
				case 'SD':
					this.assertTextAfter(i)
					break
				case 'S':
					break
				case 'RQ':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Chapters and Verses
				case 'C':
				case 'CL':
				case 'CP':
				case 'CD':
				case 'V':
				case 'CA':
					this.assertTextAfter(i)
					break
				case 'VA':
				case 'VP':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Paragraphs
				case 'P':
				case 'M':
				case 'PO':
				case 'PR':
				case 'CLS':
				case 'PMO':
				case 'PM':
				case 'PMC':
				case 'PMR':
				case 'PI':
				case 'MI':
				case 'NB':
				case 'PC':
				case 'PH':
					break
				case 'B':
					this.assertTextAfter(i)
					break
				// Poetry
				case 'Q':
				case 'QR':
				case 'QC':
				case 'QA':
				case 'QM':
				case 'QD':
				case 'B':
					this.assertTextAfter(i)
					break
				case 'QS':
				case 'QAC':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Lists
				case 'LH':
				case 'LI':
				case 'LF':
				case 'LIM':
					this.assertTextAfter(i)
					break
				case 'LITL':
				case 'LIK':
				case 'LIV':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Tables
				case 'TR':
					break;
				case 'TH':
				case 'THR':
				case 'TC':
				case 'TCR':
					this.assertTextAfter(i)
					break
				// Footnotes
				case 'FR':
				case 'FQ':
				case 'FQA':
				case 'FK':
				case 'FL':
				case 'FW':
				case 'FP':
				case 'FT':
					this.assertTextAfter(i)
					break
				case 'F':
				case 'FV':
				case 'FE':
				case 'FDC':
				case 'FM':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Cross references
				case 'XO':
				case 'XK':
				case 'XQ':
				case 'XT':
				case 'XTA':
					this.assertTextAfter(i)
					break
				case 'X':
				case 'XOP':
				case 'XOT':
				case 'XNT':
				case 'XDC':
				case 'RQ':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				// Words and characters
				case 'LIT':
					this.assertTextAfter(i)
					break
				case 'ADD':
				case 'BK':
				case 'DC':
				case 'K':
				case 'ND':
				case 'ORD':
				case 'PN':
				case 'PNG':
				case 'ADDPN':
				case 'ADD':
				case 'QT':
				case 'SIG':
				case 'SLS':
				case 'TL':
				case 'WJ':
				case 'EM':
				case 'BD':
				case 'IT':
				case 'BDIT':
				case 'NO':
				case 'SC':
				case 'SUP':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				case 'PB':
					break
				case 'FIG':
				case 'NDX':
				case 'RB':
				case 'PRO':
				case 'W':
				case 'WG':
				case 'WH':
				case 'WA':
					this.assertTextAfter(i)
					this.assertClosingTag(i)
					break
				case 'ZALN-S':
					this.assertTextAfter(i)
					this.assertClosingTag(i, false)
					break
				case 'ZALN-E':
					this.assertClosingTag(i, false)
					break
				case 'TEXT':
					break
				default:
					throw new Error(`Unknown token ${i.type} at ${this.lexer.getStrPosMessage(i.position - 1)}`)
			}
		}
	}
}

// const parser = new Parser(`
// \\c 1
// \\p
// \\v 1 In the beginning, God created the heavens and the earth. 
// \\v 2 The earth was without form and empty. Darkness was upon the surface of the deep. The Spirit of God was moving above the surface of the waters.
// \\s5
// \\v 3 God said, “Let there be light,” and there was light.
// \\v 4 God saw the light, that it was good. He divided the light from the darkness.
// \\v 5 God called the light “day,” and the darkness he called “night.” This was evening and morning, the first day. 
// `)

const parser = new Parser(fs.readFileSync('./test/en_ult/44-JHN.usfm', 'utf8'))

console.log('hooray?', parser.parse())
