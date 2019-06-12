const assert = require('assert')
const { tagTypes } = require('./constants')

const postRender = json => {
	// Move concurrent words/orphans into last verse, or into new paragraph
	json.chapters.forEach(chapter => {
		chapter.children.filter(child => child.children).forEach(child => {
			const newChildren = []
			child.children.forEach(child2 => {
				const lastChild = newChildren[newChildren.length - 1]
				if (lastChild && ['w', 'orphan'].includes(child2.tag)) {
					if (!lastChild.text) {
						lastChild.text = child2.text
					}
					else if (child2.tag === 'w') {
						lastChild.text += ' ' + child2.text
					}
					else {
						lastChild.text += child2.text
					}
				}
				else {
					newChildren.push(child2)
				}
			})
			child.children = newChildren
		})
	})

	return json
}

module.exports = {
	postRender
}
