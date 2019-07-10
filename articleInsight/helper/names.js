'use strict';

var fs=require('fs')
var Promise=require('promise')

try{
    var path=require('../datapath.json') } 
catch (error) {
    if (error.code == 'MODULE_NOT_FOUND'){
        console.log("Make sure data index file 'datapath.json' includes in the top level directory.")
        process.exit(1)
    }else{
        throw(error)
    }
}

module.exports= (callback)=>{
    let tmp=[]
    for (let name of Object.keys(path)){
        if (name.startsWith("admin")){
            tmp.push(new Promise((resolve, reject)=>{
                fs.readFile(path[name], 'utf-8', (err, result)=>{
                    if (err){
                        reject(err)
                    }else{
                        resolve(result.split('\n'))
                    }
                })
            }))
        }
    }

    var ret={}
    Promise.all(tmp).then((result)=>{
        let all=[]
        for (let arr of result){
            Array.prototype.push.apply(all, arr)
        }
        ret.admin=Array.from(new Set(all))
        return new Promise((resolve, reject)=>{
            fs.readFile(path.bot, 'utf-8', (err, content)=>{
                if (err){
                    reject(err)
                }else{
                    resolve(content.split('\n'))
                }
            })
        })
    }).then((result)=>{
        ret.bot=result
        callback(null, ret)
    })
        .catch((err)=>{
            console.log("Parsing admin/bot names failed.")
            process.exit(1)
        })
}
