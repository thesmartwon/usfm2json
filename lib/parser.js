const { Lexer } = require('./lexer')

class Parser {
	constructor(expr) {
		this.lexer = new Lexer(expr)
		this.chapters = []
		this.lastChapter = undefined
		this.paragraphStack = []
	}

	expectTextAfter(token) {
		const next = this.lexer.peek()
		if (next.type === 'TEXT') {
			return this.lexer.next()
		}

		return undefined
	}

	assertTextAfter(token) {
		const next = this.lexer.next()
		if (next.type !== 'TEXT') {
			console.error('next', next)
			throw new Error(`Expected text after token ${token.type} at ${this.lexer.getStrPosMessage(token.position - 1)}`)
		}
		return next
	}

	expectClosingTag(token) {

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
		this.lastChapter.push(element)
		this.paragraphStack.push(element)
	}

	addElement(element, appendTo) {
		appendTo.push(element)
	}

	getLastContainer() {
		const lastParagraph = this.paragraphStack[this.paragraphStack.length - 1]
		if (lastParagraph) {
			return lastParagraph.v
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
			let next

			// https://ubsicap.github.io/usfm/identification/index.html
			switch(i.type) {
				// ID tags
				case 'ID':
					next = this.assertTextAfter(i)
					const split = next.text.split(' ')
					if (split[0].length !== 3) {
						throw new Error(`Expected 3-letter book code after ${i.type} at ${this.lexer.getStrPosMessage(i.position - 1)}`)
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
				case 'S':
					next = this.expectTextAfter(i)
					if (next) {
						this.addElement(
							{ t: i.type.toLowerCase(), v: next.text },
							this.getLastContainer()
						)
					}
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
					this.expectTextAfter(i)
					break
				case 'V':
					const text = this.assertTextAfter(i).text
					const n = Number.parseInt(text.substr(0, text.indexOf(' ')))
					const v = text.substr(text.indexOf(' ') + 1, text.length)
					this.addElement({ t: 'v', n, ...(v && { v }) }, this.getLastContainer())
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
					next = this.expectTextAfter(i)
					if (next) {
						this.addElement(
							{ t: i.type.toLowerCase(), v: next.text },
							this.lastChapter
						)
					}
					else {
						this.addParagraph({ t: i.type.toLowerCase(), v: [] })
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
					next = this.expectTextAfter(i)
					if (next) {
						this.addElement(
							{ t: i.type.toLowerCase(), v: next.text },
							this.getLastContainer()
						)
					}
					break
				case 'F':
				case 'FE':
				case 'FV':
				case 'FDC':
				case 'FM':
					next = this.expectTextAfter(i)
					if (!next.text[0]) {
						throw new Error(`Expected 1-character footnote caller after ${i.type} at ${this.lexer.getStrPosMessage(i.position - 1)}`)
					}
					this.addParagraph({
						t: i.type.toLowerCase(),
						// + – indicates that the caller should be generated automatically by the translation editor, or publishing tools.
						// - – indicates that no caller should be generated, and is not used.
						// ? – where ? represents the character to be used for the caller. The caller is defined for the specific note by the author.
						c: next.text[0],
						v: [],
						// Expect closing tag for our nested elements
						expectedType: i.type + '*'
					})
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
					next = this.assertTextAfter(i)
					this.addElement(
						{ t: i.type.toLowerCase(), v: next.text },
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
					this.addElement(
						{ t: i.type.toLowerCase(), v: i.text },
						// , a: text.attributes
						this.getLastContainer()
					)
					break
				// Parapgraph closing tags
				case 'F':
				case 'FE*':
				case 'FV*':
				case 'FDC*':
				case 'FM*':
				case 'F*':
					const lastParagraph = this.paragraphStack[this.paragraphStack.length - 1]
					if (lastParagraph.expectedType === i.type) {
						delete lastParagraph.expectedType // Don't include in output
						this.paragraphStack.pop()
					}
					break
				// Element closing tags
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
				case 'FQA*': // Not officially in spec but UnfoldingWord uses it 505 times
					break
				default:
					const { line, column } = Lexer.strPos(this.lexer.input, this.lexer.position)
					console.warn(`Unknown token ${i.type} at ${line}:${column}`)
			}
		}

		return this.chapters
	}
}

module.exports = { Parser }