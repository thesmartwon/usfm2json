# usfm2json
Yet another usfm to json parser. Meant to render [UnfoldingWord texts](https://git.door43.org/unfoldingWord) to json for use in [OpenBible](https://github.com/thesmartwon/openbible).

Uses a Pratt parser because my long regex was getting way too jank. No dependencies.

## AST
All we need in our AST is what we will have in our HTML.

These ASTs will take bandwidth. I'm not going to deliver something to the user that they don't need to render the text on their screen.


AST
chapters: [
	[
		{t: 's5', v: 'blah blah'},
		{t: 'p', v: [
			{t: 'v', n: 1, v: 'You have head that'}
			{t: 'w', v: 'Bob said, "'},
			{t: 'q', v: 'ABCDEFG'},
			{t: 'w', v: '," and then he was happy.'},
		]}
	]
]

tags to make HTML

s# => headings
c => nothing
p => paragraph
	v => span <strong>{num}</strong> {text}
	w => fragment
	q => italic
