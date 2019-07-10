'use strict';

var utility=require('../helper')
var models=require('../db')

var Accept=utility.messager.accept
var Reject=utility.messager.reject

/*
 * Feature implemented: Overall - Find titles of the two articles with highest/lowest number of revisions
 */
module.exports.byRevision = (req, res)=>{
    var limit= (isNaN(parseInt(req.query.limit)))? 2: parseInt(req.query.limit)
    var asce = parseInt(req.query.asce)
    models.revision.numberOfRevision(limit, parseInt(req.query.asce), (err, result)=>{
        if (err){
            new Reject(res, 200, 500).send()
            return
        }
        new Accept(res, 200, 200).append(result).send()
    })
}

/*
 * Feature implemented: Overall - Find the article edited by largest/smallest group of registered users.
 */
module.exports.byUser = (req, res) => {
    var limit= (isNaN(parseInt(req.query.limit)))? 1: parseInt(req.query.limit)
    var asce = parseInt(req.query.asce)
    models.revision.numberOfRevisionByRegisteredUser(limit, parseInt(req.query.asce), (err, result)=>{
        if (err){
            new Reject(res, 200, 500).send()
            return
        }
        new Accept(res, 200, 200).append(result).send()
    })
}


/*
 * Feature implemented: Overall - Find top 2 articles with the longest/shortest history
 */
module.exports.byHistory = (req, res) => {
    var asce = parseInt(req.query.asce)
    models.revision.age(parseInt(req.query.asce), (err, result)=>{
        new Accept(res, 200, 200).append(result).send()
    })
}

/*
 * Feature implemented:
 * Overall - revision number distribution by year and by user type across the whole dataset
 * Overall - revision number distribution by user type
 */
module.exports.distribution = (req, res) =>{
    var byType = parseInt(req.query.byType)
    var byYear = (req.query.byYear=="1")? true: false
    models.revision.overallDistribution(req.app.locals.admin, req.app.locals.bot, byYear, (err, result)=>{
        new Accept(res, 200, 200).append(result).send()
    })
}
