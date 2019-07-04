const assert = require('assert')
const { tagTypes } = require('./constants')

const postRender = json => {
	json.chapters.forEach(chapter => {
		chapter.children.forEach(child => {
			// Remove trailing space after quote start
			if (child.text) {
				child.text = child.text.replace(/([“‘])\s+/, "$1")
			}

			// Move concurrent words/orphans into last verse, or into new paragraph
			if (child.children) {
				const newChildren = []
				child.children.forEach(child2 => {
					const lastChild = newChildren[newChildren.length - 1]
					if (lastChild && ['w', 'orphan'].includes(child2.tag)) {
						if (!lastChild.text) {
							lastChild.text = child2.text
						}
						else {
							if (/[\w”?.,!—]$/.test(lastChild.text) && /^[\w“—]/.test(child2.text))
								lastChild.text += ' '
							lastChild.text += child2.text
						}
					}
					else {
						newChildren.push(child2)
					}
				})
				child.children = newChildren
			}
		})
	})

	return json
}

module.exports = {
	postRender
}
