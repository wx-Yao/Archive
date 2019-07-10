var services=require('../services')
var Reject=require('../helper').messager.reject

var express=require("express")
var validator=require("validator")
var router=express.Router()
var models=require("../db")

// BELOW MIDDLEWARES ARE PARAMETER CHECKERS
function checkAscending(req, res, next) {
    if (!["1","-1"].includes(req.query.asce)){
        new Reject(res, 422, 422).send()
    }else{
        next()
    }
}

function checkLimit(req, res, next){
    // if limit presents, it has to be numeric
    if (req.query.limit && !validator.isNumeric(req.query.limit)){
        new Reject(res, 422, 422).send()
        return
    }

    // Limit must be greter than 0
    if (parseInt(req.query.limit)<=0){
        new Reject(res, 422, 422).send()
        return
    }
    next()
}

function checkArticleName(req, res, next){
    if (req.query.article==undefined ){
        new Reject(res, 422, 422).send()
        return
    }

    // Pre check for performance reason
    models.revision.checkArticle( req.query.article, (err, exist)=>{
        if (!exist){
            new Reject(res, 404, 404).because("Article not found").send()
            return
        }else{
            next()
        }
    })
}

// Routes to overall analytics feature
router.get('/overall/toprevised',checkAscending, checkLimit, services.overall.byRevision)
router.get('/overall/popularity', checkAscending, checkLimit, services.overall.byUser)
router.get('/overall/history', checkAscending, checkLimit, services.overall.byHistory)
router.get('/overall/distribution', (req,res,next)=>{
    if (
        (req.query.byType!="1")||
        !["1","0"].includes(req.query.byYear)
    ){
        new Reject(res, 422, 422).send()
    }else{
        next()
    }
},services.overall.distribution)

// Routes to individual analytics feature
router.get('/article/names', services.individual.getArticleNames)
router.get('/article/stats',checkArticleName, services.individual.articleStatsByName)
router.get('/article/distribution', checkArticleName, (req, res, next)=>{
    // They have to present and has to be binary value
    if (
        !["1","0"].includes(req.query.byType)||
        !["1","0"].includes(req.query.byYear)||
        !["1","0"].includes(req.query.byUser)
    ){
        new Reject(res, 422, 422).send()
        return
    }
    // Their combination must fall into such category
    validcom=["100","110","011"]
    if (!validcom.includes(req.query.byType+req.query.byYear+req.query.byUser)){
        new Reject(res, 422, 422).send()
        return
    }
    // From and to: if present, they must present together
    if (
        (req.query.from==undefined && req.query.to!=undefined)||
        (req.query.to==undefined && req.query.from!=undefined)
    ){
        new Reject(res, 422, 422).send()
        return
    }

    // From and to must be integer string
    if ( req.query.from && req.query.to &&
        !(validator.isNumeric(req.query.from) && validator.isNumeric(req.query.to))
    ){
        new Reject(res, 422, 422).send()
        return
    }
    // from <= to
    if (parseInt(req.query.from)>parseInt(req.query.to)){
        new Reject(res, 422, 422).send()
        return
    }
    next()
}, services.individual.distribution)

router.get("/article/update", checkArticleName, services.individual.checkUpdate)


// Routes to author analytics feature
router.get('/author/names',services.author.getAuthorNames)
router.get('/author/stats',(req,res,next)=>{
    if (req.query.author==undefined){
        new Reject(res, 422, 422).send()
    }else{
        next()
    }
}, services.author.authorStatsByName)

module.exports=router
