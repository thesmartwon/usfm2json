const assert = require('assert')
const { tagTypes } = require('./constants')

// All verses must have a parent
const NO_OPRHAN_VERSES = true

const isMilestone = tag => {
	if (tag.startsWith('z') || tagTypes.milestone.includes(tag.slice(0, tag.length - 2)))
		return true

	return false
}

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
			if (token.num > 1) {
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
		else if (isMilestone(token.tag)) {
			// We don't want to render milestones
		}
		else {
			// If we're in a paragraph, add it there
			if (curChild && tagTypes.paragraph.includes(curChild.tag)) {
				curChild.children.push(token)
			}
			// If we're not in a paragraph and it's an element that must be nested
			else if (NO_OPRHAN_VERSES && tagTypes.text.includes(token.tag)) {
				curChapter.children.push({ tag: 'p', children: [token], auto: true })
			}
			// Just slap it on the end
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
