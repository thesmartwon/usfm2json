const { Parser } = require('./parser')

const usfm2json = usfmText => {
	const parser = new Parser(usfmText)

	return parser.parse()
}

module.exports = { usfm2json }

// Usage:
// const ast = usfm2json(fs.readFileSync('./test/en_ult/46-ROM.usfm', 'utf8'))
// fs.writeFileSync('out.json', JSON.stringify(ast, null, 2))
