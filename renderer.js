const assert = require('assert')
const { tagTypes } = require('./constants')

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
			res.chapters.push({num: token.num, ...curChapter})
			if (res.chapters.length > 1) curChapter = { intro: [], children: [] }
		}
		else if (res.chapters.length === 0) {
			return
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
			else {
				curChapter.children.push(token)
			}
		}
	})	
	res.chapters.push(curChapter.intro.concat(curChapter.children))

	return res
}

module.exports = {
	renderTokens
}
