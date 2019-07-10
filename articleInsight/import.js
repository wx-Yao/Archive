// CP THIS FILE TO THE DIRECTORY WITH  JSON FILES TO IMPORT THEM TO DATABASE
// DONT TOUCH THIS FILE
'use strict';

var db=require("./db")
var fs=require("fs")
var revisionModel=db.revision
var Promise=require('promise')

var files=process.argv.slice(2)

// ASSUME we have at least 10 files
if (files.length<1){
    console.log("May in the wrong directory")
    process.exit(1)
}

for (let filename of files){
    fs.readFile(filename, 'utf-8', (err, c)=>{
        let content = JSON.parse(c)
    for (let obj of content){
        obj.timestamp=new Date(obj.timestamp)
    }
    revisionModel.collection.insert(content,(err,result)=>{
        console.log("Inserted "+content.length+" records")
    })

    })
}
