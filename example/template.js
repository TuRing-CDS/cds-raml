/**
 * Created by Z on 2016-11-30.
 */
"use strict"

var fn = function(root){
    // console.log(item)
    if(!root.methods){
        return "";
    }
    let texts = root.methods.map(function(item,index){
        return `
            let api${index} = new Api().method("${item.method.toUpperCase()}")
            .path("${root.path}")
            .detail(\`${item.description}\`)
            .exec(function(params,callback){
                //do something you like
            });
            
            $.use(api${index});
        `
    })
    return texts.join("\r\n");
}

print(`
"use strict"
const Api = require("rsos-rest").Api;
const Types = require("rsos-rest").Types;
module.exports = function($)}{
    ${ fn(item) }
}
`)