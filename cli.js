#!/usr/bin/env node
const fs = require('fs')
const { usfm2json } = require('./lib/usfm2json')

const book = fs.readFileSync(process.argv[2], 'utf8')
const json = usfm2json(book)
// console.log(JSON.stringify(json, null, 2))

