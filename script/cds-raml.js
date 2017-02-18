#! /usr/bin/env node

// console.log()

const path = require("path")
const Raml = require("../lib")
console.log(process.cwd())
new Raml(path.join(process.cwd(),process.argv.slice(2).join('')))