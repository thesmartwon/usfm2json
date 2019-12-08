const { Lexer } = require('./lexer')

class Parser {
	constructor(expr) {
		this.lexer = new Lexer(expr)
		this.chapters = []
		this.lastChapter = undefined
		this.lastParagraph = undefined
		this.lastElement = undefined
		this.expectedClosingTypes = []
	}

	expectTextAfter(token) {
		const next = this.lexer.peek()
		if (next.type === 'TEXT') {
			return this.lexer.next()
		}
	}

	assertTextAfter(token) {
		const next = this.lexer.next()
		if (next.type !== 'TEXT') {
			console.error('next', next)
			throw new Error(`Expected text after token ${token.type} at ${this.lexer.getStrPosMessage(token.position - 1)}`)
		}
		return next
	}

	expectClosingTag(token, prependTag = true) {
		const expectedType = `${prependTag ? token.type : ''}*`
		this.expectedClosingTypes.push(expectedType)
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

	addChapter() {
		this.lastChapter = []
		this.chapters.push(this.lastChapter)
	}

	addParagraph(element) {
		// No nested paragraphs (yet)
		this.lastChapter.push(element)
		this.lastParagraph = element
	}

	addElement(element, appendTo) {
		appendTo.push(element)
		this.lastElement = element
	}

	getLastContainer() {
		if (this.lastParagraph) {
			return this.lastParagraph.v
		}
		if (this.lastChapter) {
			return this.lastChapter
		}

		this.addChapter()
		return this.lastChapter
	}

	parse() {
		for (let i = this.lexer.next(); i != 'EOF'; i = this.lexer.next()) {
			// console.log(i)
			let next, text

			// https://ubsicap.github.io/usfm/identification/index.html
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
					this.expectTextAfter(i)
					break
				case 'IOR':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
					break
				case 'IQT':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
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
					this.expectTextAfter(i)
					break
				case 'S':
					break
				case 'RQ':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
					break
				// Chapters and Verses
				case 'C':
					this.expectTextAfter(i)
					this.addChapter(i)
					break
				case 'CL':
				case 'CP':
				case 'CD':
				case 'V':
					text = this.expectTextAfter(i).text
					const n = Number.parseInt(text.substr(0, text.indexOf(' ')))
					const v = text
						.substr(text.indexOf(' ') + 1, text.length)
						.trim()
					this.addElement({ t: 'v', n, v }, this.getLastContainer())
					break
				case 'CA':
					this.expectTextAfter(i)
					break
				case 'VA':
				case 'VP':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
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
					this.addParagraph({ t: i.type.toLowerCase(), v: [] })
					break
				case 'B':
					this.expectTextAfter(i)
					break
				// Poetry
				case 'Q':
				case 'QR':
				case 'QC':
				case 'QA':
				case 'QM':
				case 'QD':
				case 'B':
					text = this.expectTextAfter(i)
					if (text) {
						this.addElement(
							{ t: i.type.toLowerCase(), v: text.text },
							this.lastChapter
						)
					}
					else {
						this.addElement(
							{ t: i.type.toLowerCase(), v: [] },
							this.lastChapter
						)
					}
					break
				case 'QS':
				case 'QAC':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
					break
				// Lists
				case 'LH':
				case 'LI':
				case 'LF':
				case 'LIM':
					this.expectTextAfter(i)
					break
				case 'LITL':
				case 'LIK':
				case 'LIV':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
					break
				// Tables
				case 'TR':
					break;
				case 'TH':
				case 'THR':
				case 'TC':
				case 'TCR':
					this.expectTextAfter(i)
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
					this.expectTextAfter(i)
					break
				case 'F':
				case 'FV':
				case 'FE':
				case 'FDC':
				case 'FM':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
					break
				// Cross references
				case 'XO':
				case 'XK':
				case 'XQ':
				case 'XT':
				case 'XTA':
					this.expectTextAfter(i)
					break
				case 'X':
				case 'XOP':
				case 'XOT':
				case 'XNT':
				case 'XDC':
				case 'RQ':
					this.expectTextAfter(i)
					this.expectClosingTag(i)
					break
				// Words and characters
				case 'LIT':
					this.expectTextAfter(i)
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
					this.expectTextAfter(i)
					this.expectClosingTag(i)
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
					text = this.assertTextAfter(i)
					this.addElement(
						{ t: i.type.toLowerCase(), v: text.text },
						// , a: text.attributes
						this.getLastContainer()
					)
					this.expectClosingTag(i)
					break
				case 'ZALN-S':
					this.expectTextAfter(i)
					this.assertClosingTag(i, false)
					break
				case 'ZALN-E':
					this.assertClosingTag(i, false)
					break
				case 'TEXT':
					break
				// Closing tags
				case 'IOR*':
				case 'IQT*':
				case 'IQT*':
				case 'IQT*':
				case 'IQT*':
				case 'RQ*':
				case 'CA*':
				case 'VA*':
				case 'VP*':
				case 'QS*':
				case 'QAC*':
				case 'LITL*':
				case 'LIK*':
				case 'LIV*':
				case 'F*':
				case 'FE*':
				case 'FQA*': // Not officially in spec
				case 'FV*':
				case 'FDC*':
				case 'FM*':
				case 'X*':
				case 'XOP*':
				case 'XOT*':
				case 'XNT*':
				case 'XDC*':
				case 'RQ*':
				case 'ADD*':
				case 'BK*':
				case 'DC*':
				case 'K*':
				case 'ND*':
				case 'ORD*':
				case 'PN*':
				case 'PNG*':
				case 'ADDPN*':
				case 'QT*':
				case 'SIG*':
				case 'SLS*':
				case 'STL*':
				case 'WJ*':
				case 'EM*':
				case 'BD*':
				case 'IT*':
				case 'BDIT*':
				case 'NO*':
				case 'SC*':
				case 'SUP*':
				case 'FIG*':
				case 'NDX*':
				case 'RB*':
				case 'PRO*':
				case 'W*':
				case 'WG*':
				case 'WH*':
				case 'WA*':
				case 'JMP*':
					const expectedType = this.expectedClosingTypes.pop()
					if (!expectedType === i.type) {
						throw new Error(`Expected closing tag ${expectedType}, not ${i.type} at ${this.lexer.getStrPosMessage(i.position - 1)}`)
					}
					break
				default:
					throw new Error(`Unknown token ${i.type} at ${this.lexer.getStrPosMessage(i.position - 1)}`)
			}
		}

		return this.chapters
	}
}

module.exports = { Parser }