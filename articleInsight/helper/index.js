'use strict';

var crypto=require('crypto')
var fs=require('fs')

module.exports.parseName=require("./names.js")
module.exports.wikifetch=require("./api")
module.exports.messager=require("./messager.js")

module.exports.randomString= () => {
    return crypto.randomBytes(32).toString('hex')
}

module.exports.removeDuplicatedObj = (array) =>{
    return Array.from(new Set(array.map(JSON.stringify))).map(JSON.parse);
}
