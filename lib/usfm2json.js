const fs = require('fs')
const { Lexer } = require('./lexer')

const usfm2json = usfmText => {
	const lexer = new Lexer(usfmText)

	for (let cur = lexer.next(); cur !== 'EOF'; cur = lexer.next()) {
		if (cur)
			console.log(cur)
	}

	// return parser.parse()
}

module.exports = { usfm2json }

// const ast = usfm2json(fs.readFileSync('./test/en_ult/46-ROM.usfm', 'utf8'))

// console.log(JSON.stringify(ast, null, 2))