/**
 * Created by Z on 2016-11-30.
 */
"use strict"
const raml2obj = require('raml2obj');
const fs = require("fs");
const path = require("path")
const mkdirp = require("mkdirp")
const vm = require("vm")
class RAML {
    constructor(file, output, temple) {
        this.file = file;
        this.fileTxt = fs.readFileSync(this.file, "utf8");
        this.output = output
        this.temple = temple
        var self = this;
        raml2obj.parse(this.fileTxt).then(function (raml) {
            self.raml = raml;
            return self.loadResources(self.raml.resources);
        }).then(function (list) {
            list.forEach(function (item) {
                if (item.path.indexOf("{") == -1) {
                    mkdirp.mkdirp(path.join(self.output, item.path), function () {
                        var context = vm.createContext()
                        context.item = item;
                        context.console = console
                        context.print = function(txt){
                            fs.writeFileSync(path.join(self.output, item.path) + "/index.js", txt)
                        }
                        vm.runInContext(self.temple, context)
                    })
                }
            })
        })
    }

    loadResources(resources) {
        var result = [];
        var self = this;
        for (var i = 0; i < resources.length; i++) {
            var item = resources[i]
            result.push({
                path: [item.parentUrl, item.relativeUri].join(""),
                methods: item.methods,
                description: item.description,
                uniquedId: item.uniquedId
            });
            if (item.resources) {
                result = result.concat(self.loadResources(item.resources))
            }
        }
        return result
    }
}

module.exports = RAML
