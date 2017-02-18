/**
 * Created by Z on 2016-11-30.
 */
"use strict"
const fs = require('fs');
const path = require('path')
const mkdirp = require('mkdirp')
const raml1Parser = require('raml-1-parser');
const async = require('async');
const ejs = require('ejs');
class CdsRaml {
    constructor(ramlPath, options) {
        this.ramlPath = ramlPath;
        this.hasError = false;
        this.options = options || {};
        this.options.dirDeep = this.options.dirDeep || 1;
        this.options.outPut = this.options.outPut || 'output';
        this.options.template = this.options.template || path.join(__dirname, 'template.ejs');
        this.options.isDebug = this.options.isDebug || false;
        this.parse();
    }

    parse() {
        this.api = raml1Parser.loadApiSync(path.resolve(this.ramlPath));
        this.api.errors().forEach((item) => {
            console.log(JSON.stringify({
                code: item.code,
                message: item.message,
                path: item.path,
                start: item.start,
                end: item.end,
                isWarning: item.isWarning
            }, null, 2));
            this.hasError = true;
        });
        if (this.hasError) {
            return process.exit();
        }
        this.apiJson = this.api.toJSON();
        this.apis = {};
        this.apiJson.resources.map((item) => {
            let uri = item.relativeUri;
            let uris = uri.split('/').filter((item) => item.trim() != '');
            let dirPath = [process.cwd(), this.options.outPut].concat(uris.slice(0, this.options.dirDeep)).join(path.sep);
            if (!this.apis[dirPath]) {
                this.apis[dirPath] = [];
            }
            this.apis[dirPath].push(item);
        });
        // console.log(this.apis);
        async.map(Object.keys(this.apis), (item, callback) => {
            mkdirp(item, (err) => {
                ( err && callback(err) || callback(null, item))
            })
        }, (err, list) => {
            if (err) {
                console.log(err.stack);
                return process.exit();
            }
            this.writeApiFile();
        })
    }

    writeApiFile() {
        let templateContent = fs.readFileSync(this.options.template).toString();
        async.map(Object.keys(this.apis), (item, callback) => {
            let file = [item, 'index.js'].join(path.sep);
            let data = this.apis[item];
            let content = ejs.render(templateContent, {apis: data}, {debug: this.options.isDebug});
            fs.writeFile(file, content, callback);
        }, (err, list) => {
            if (err) {
                console.log(err.stack);
                return process.exit();
            }
        })
    }
}

module.exports = CdsRaml
