/**
 * Created by Z on 2016-11-30.
 */
"use strict"
const raml2obj = require('raml2obj');
const fs = require("fs");
const path = require("path")
const mkdirp = require("mkdirp")
class RAML {
    constructor(file, output) {
        this.file = file;
        this.fileTxt = fs.readFileSync(this.file, "utf8");
        this.output = output
        var self = this;
        raml2obj.parse(this.fileTxt).then(function (raml) {
            self.raml = raml;
            return self.loadResources(self.raml.resources);
        }).then(function (list) {
            let paths = list.map(function (item) {
                return item.path
            })
            var mkd = function (array, callback) {
                let item = array.shift();
                if (item) {
                    if (item.indexOf('{') != -1) {
                        return mkd(array, callback)
                    }
                    return mkdirp(path.join(output, item), function (err, msg) {
                        mkd(array, callback);
                    })
                }
                return callback(null, true);
            }
            mkd(paths, function () {
                var temp = {};
                list.forEach(function (item) {
                    item.path = item.path.replace('{', ':').replace('}', '');
                    item.tpath = item.path.substr(0, item.path.indexOf(':') == -1 ? item.path.length : item.path.indexOf(':') - 1);
                    if (!temp[item.tpath]) {
                        temp[item.tpath] = {};
                    }
                    temp[item.tpath][item.path] = item.methods;
                })
                for (var key in temp) {
                    var item = temp[key];
                    let text = 'module.exports = function(ns,Api){\r\n';
                    for (var sub in item) {
                        // console.log(key,item[sub])
                        text += item[sub].map(function (item, index) {
                            console.log(item);
                            let requireds = [];
                            return `\tns('${item.method.toUpperCase()} ${sub}',new Api()${
                                Object.keys(item.queryParameters || {}).map(function (t) {
                                    if (item.queryParameters[t].required) {
                                        requireds.push(t);
                                    }
                                    return `.param('${t}',Api.Types.TrimString)`
                                }).join('')
                                } ${ requireds.length > 0 ? `.required('${requireds.join("','")}')` : ''}.exec(function(params,callback){}));\r\n`;
                        }).join('\r\n')
                    }
                    text += "}\r\n"
                    fs.writeFileSync(path.join(output, key + "/index.js"), text)
                }
            })
        }, console.log)
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
