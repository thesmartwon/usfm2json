const { takeSnapshot } = require('./util/takeSnapshot')

describe('en_ust', () => {
	takeSnapshot('./test/en_ust/*.usfm')
})