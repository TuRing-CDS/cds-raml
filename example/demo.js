/**
 * Created by Z on 2016-11-30.
 */
"use strict"
const path = require("path")
const Raml = require("../lib")
const fs = require("fs");

var raml = new Raml(path.join(__dirname,"./demo.raml"))

// console.log(raml)