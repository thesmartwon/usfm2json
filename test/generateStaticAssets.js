const fs = require('fs')
const glob = require('glob')
const { usfm2json } = require('../lib/usfm2json')

glob.sync('./test/**/*.usfm').forEach(file => {
	console.log(`Rendering ${file}`)
	usfm2json(fs.readFileSync(file, 'utf8'))
})

// usfm2json(fs.readFileSync('./test/en_ust/13-1CH.usfm', 'utf8'))

