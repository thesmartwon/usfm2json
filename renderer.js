const assert = require('assert')
const { tagTypes } = require('./constants')

// All verses must have a parent
const NO_OPRHAN_VERSES = true

const renderTokens = tokens => {
	const res = { chapters: [] }
	let curChapter = { children: [] }

	tokens.forEach(token => {
		const curChild = curChapter.children[curChapter.children.length - 1]

		if (tagTypes.identification.includes(token.tag)) {
			res[token.tag] = token.text
		}
		else if (tagTypes.intro.includes(token.tag)) {
			res.intro = res.intro || []
			res.intro.push(token)
		}
		else if (tagTypes.chapterIntro.includes(token.tag)) {
			curChapter.intro = curChapter.intro || []
			curChapter.intro.push(token)
		}
		else if (token.tag === 'c') {
			curChapter.num = token.num
			if (res.chapters.length > 0) {
				res.chapters.push(curChapter)
				curChapter = { children: [] }
			}
		}
		else if (tagTypes.paragraph.includes(token.tag)) {
			curChapter.children.push({ children: [], ...token })
		}
		else if (tagTypes.heading.includes(token.tag)) {
			curChapter.children.push(token)
		}
		else if (tagTypes.verseAlt.includes(token.tag)) {
			assert(curChild.tag === 'v', tagTypes.verseAlt + ' must follow "v" tag')
			curChild[token.tag] = token.text
		}
		else {
			if (curChild && tagTypes.paragraph.includes(curChild.tag)) {
				curChild.children.push(token)
			}
			else if (NO_OPRHAN_VERSES && token.tag === 'v') {
				curChapter.children.push({ tag: 'p', children: [token], auto: true })
			}
			else {
				curChapter.children.push(token)
			}
		}
	})	
	res.chapters.push(curChapter)

	return res
}

module.exports = {
	renderTokens
}
