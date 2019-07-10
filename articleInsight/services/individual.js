'use strict';

var models=require("../db")
var Promise=require("promise")

var utility=require('../helper')
var Accept=utility.messager.accept
var Reject=utility.messager.reject


/*
 * Feature implemented: 
 * Individual
 * return title, total revision times and top 5 revisors with their revision times of a given article
 */
module.exports.articleStatsByName = (req, res) =>{
    var article=req.query.article
    models.revision.articleInfoByName(req.app.locals.admin, req.app.locals.bot, article,(err,result)=>{
        if (Object.keys(result).length==0){
            new Reject(res, 200, 404).because("Article not found").send()
            return
        }
        new Accept(res, 200, 200).append(result).send()
    } )
}


/*
 * Feature implemented: return all article names in the database
 */
module.exports.getArticleNames = (req, res) =>{
    models.revision.getArticleTitle((err, result)=>{
        new Accept(res, 200, 200).append(result).send()
    })
}

/*
 * Feature implemented:
 * Individual
 * Return revision number distribution based on user type for this article.
 * Return revision number distributed by year and by user type for this article.
 * Return revision number distributed by year made by top 5 users for this article
 * depending on request parameters
 */
module.exports.distribution = (req, res) => {
    var article = req.query.article
    var byType = (req.query.byType=="1")? true: false
    var byYear = (req.query.byYear=="1")? true: false
    var byUser = (req.query.byUser=="1")? true: false
    var from = isNaN(parseInt(req.query.from))? -1: parseInt(req.query.from)
    var to = isNaN(parseInt(req.query.to))? 9999: parseInt(req.query.to)
    if (byType){
        models.revision.articleYearDistributeByUser(req.app.locals.admin, req.app.locals.bot, byYear, from, to, article, (err, result)=>{
        if (Object.keys(result).length==0){
            new Reject(res, 200, 404).because("Author not found").send()
            return
        }
        new Accept(res, 200, 200).append(result).send()
        })

    } else{
        var top5users=[]
        new Promise((resolve, reject)=>{
            models.revision.articleInfoByName(req.app.locals.admin, req.app.locals.bot, article, (err, result)=>{
                if (err|| Object.keys(result).length==0){
                    reject(new Error())
                }else{
                    for (let record of result.detail){
                        top5users.push(record._id)
                    }
                    resolve(top5users)
                }
            })
        }).then((top5users)=>{
            var ret=[]
            for (let name of top5users){
                let promise=new Promise((resolve,reject)=>{
                    models.revision.userYearlyRevision(name, article, from, to, (err, result)=>{
                        if (err){
                            reject(err)
                        }else{
                            resolve({[name]:result})
                        }
                    })
                })
                ret.push(promise)
            }
            return Promise.all(ret)
        }).then((result)=>{
            new Accept(res, 200, 200).append(result).send()
        }).catch((err)=>{
            new Reject(res, 200, 422).because("The beast breaks. Contact backend developer,").send()
        })
    }
}

/*
 * Feature implemented: check wiki API for update
 */
module.exports.checkUpdate = (req, res) =>{
    var article=req.query.article
    models.revision.getLatestTimestampAndrevid(article, (err, ret)=>{
        let now = new Date()
        ret=ret[0]
        let then=new Date(ret.timestamp)
        let revid=ret.revid
        if (now - then < 24*60*60*1000){
            new Accept(res, 200, 200).because("Don't need to update").addAttributes({"updated":0, "needUpdate":false}).send()
        }else{
            utility.wikifetch(article, ret.timestamp, (err, newdocs)=>{
                if (err){
                    new Reject(res, 404, 404).because("remote wiki API might be broken").send()
                }else{
                    var removeIndex
                    for (let doc of newdocs){
                        if (doc.revid==revid){
                            removeIndex=newdocs.indexOf(doc)
                            continue
                        }
                        doc.title=article
                        var tmpobj=new models.revision(doc)
                        tmpobj.save()
                    }
                    if (removeIndex!=undefined){
                        newdocs.pop(removeIndex)
                    }
                    new Accept(res, 200, 200).addAttributes({"needUpdate":true, "updated":newdocs.length}).send()
                }
            })
        }
    })
}
