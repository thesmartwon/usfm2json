const { takeSnapshot } = require('./util/takeSnapshot')

describe('en_ust', () => {
	takeSnapshot('en_ust', './test/en_ust/*.usfm')
})