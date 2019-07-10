'use strict';

var utility=require('../helper')
var Reject=utility.messager.reject
var Accept=utility.messager.accept
var models=require('../db')
var reject=require('../helper').reject

/*
 * Feature implemented: Return all author names
 */
module.exports.getAuthorNames = (req, res)=> {
    models.revision.getAuthorNames((err, result)=>{
        new Accept(res, 200, 200).append(result).send()
    })
} 
/*
 * Feature implemented: find the articles’ names along with number of revisions made by the author; find time stamps of all revisions made to an article, if that author made more than revision to an article he is attributed with.
 */
module.exports.authorStatsByName = (req, res)=>{
    var name=req.query.author
    models.revision.authorInfoByName(name, (err, result)=>{
        if (Object.keys(result).length!=0){
            new Accept(res, 200, 200).append(result).send()
        }else{
            new Reject(res, 404, 404).because("Author not found").send()
        }
    })
}
