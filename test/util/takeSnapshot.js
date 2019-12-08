const fs = require('fs')
const glob = require('glob')
const path = require('path')
const { usfm2json } = require('../../lib/usfm2json')
const { toMatchFile } = require('jest-file-snapshot')

expect.extend({ toMatchFile });
const takeSnapshot = dir => {
	glob.sync(dir).forEach(file => {
		const chapters = usfm2json(fs.readFileSync(file, 'utf8'))
		chapters.forEach((chapter, index) => {
			it(`${path.basename(file, '.usfm')} ${index + 1}`, () => {
				expect(JSON.stringify(chapter, null, 2)).toMatchFile()
			})
		})
	})
}

module.exports = { takeSnapshot }