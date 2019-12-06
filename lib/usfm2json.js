const fs = require('fs')
const { ParserBuilder } = require('./parser')

const usfm2json = usfmText => {
	const parser = new ParserBuilder(usfmText)
		.led('TEXT', 0, (left, t) => left.concat(t.text.replace(/\r?\n/g, '')))
		.build();

	// for (let cur = lexer.next(); cur !== 'EOF'; cur = lexer.next()) {
	// 	if (cur)
	// 		console.log(cur)
	// }

	console.log(parser.parse())
	// return parser.parse()
}

module.exports = { usfm2json }

// const ast = usfm2json(fs.readFileSync('./test/en_ult/46-ROM.usfm', 'utf8'))

// console.log(JSON.stringify(ast, null, 2))