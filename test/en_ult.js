const { takeSnapshot } = require('./util/takeSnapshot')

describe('en_ult', () => {
	takeSnapshot('en_ult', './test/en_ult/*.usfm')
})
