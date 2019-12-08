const { takeSnapshot } = require('./util/takeSnapshot')

describe('en_ult', () => {
	takeSnapshot('./test/en_ult/*.usfm')
})
