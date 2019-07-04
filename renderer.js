const assert = require('assert')
const { tagTypes } = require('./constants')

// All verses must have a parent (e.g. paragraph)
const NO_OPRHAN_VERSES = true
// All tags must have an attribute other than just "tag"
const NO_EMPTY_CHILDREN = true

const isMilestone = tag => {
	if (tag.startsWith('z') || tagTypes.milestone.includes(tag.slice(0, tag.length - 2)))
		return true

	return false
}

const renderTokens = tokens => {
	const res = { chapters: [] }
	let curChapter = { children: [], num: 1 }
	let encounteredChapterNum = false

	tokens.forEach(token => {
		const curChild = curChapter.children[curChapter.children.length - 1]

		if (token.num) {
			// If not supposed to have \marker# (like "\id 2 Cor")
			if (!tagTypes.numbered.includes(token.tag)) {
				token.text = token.num + token.text
				delete token.num
			}
			else if (typeof token.num === 'string') {
				token.num = token.num.trimEnd()
			}
		}

		if (tagTypes.identification.includes(token.tag)) {
			res[`${token.tag}${token.num || ''}`] = token.text
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
			if (!encounteredChapterNum) {
				curChapter.num = token.num
				encounteredChapterNum = true
			}
			else {
				res.chapters.push(curChapter)
				curChapter = { children: [], num: token.num }
			}
		}
		else if (tagTypes.paragraph.includes(token.tag)) {
			curChapter.children.push({ children: [], ...token })
		}
		else if (NO_EMPTY_CHILDREN && Object.keys(token).length === 1 || isMilestone(token.tag)) {
			// We don't want to render things without text
			// or any milestones which waste a ton of space
		}
		else if (tagTypes.heading.includes(token.tag)) {
			curChapter.children.push(token)
		}
		else if (tagTypes.verseAlt.includes(token.tag)) {
			assert(curChild.tag === 'v', tagTypes.verseAlt + ' must follow "v" tag')
			curChild[token.tag] = token.text
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
