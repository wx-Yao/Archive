'use strict';

var mongoose=require('mongoose')
mongoose.Promise=global.Promise
var Schema=mongoose.Schema

var utility=require('../helper')

var revisionSchema=new Schema({
    revid: {type: Number, required: true, index: true, unique: true},
    title: {type: String, required: true, index: true},
    timestamp: {type: Date, required: true},
    // Jesus we have empty user field in the dataset.
    user: {type: String, required: false, index: true},
    anon: {type: String, required: false}
},{strict: false})

revisionSchema.index({title:1, user:1})

revisionSchema.statics.checkArticle = function(article, callback) {
    this.countDocuments({"title": article}, function(err, exist){
        if (exist){
            callback(null, true)
        }else
            callback(null, false)
    })
}

revisionSchema.statics.numberOfRevision= function(limit, asce, callback) {
    this.aggregate([{
        $group: {
            _id: "$title",
            revisionCount: {$sum:1}
        }
    }]).sort({'revisionCount': asce}).limit(limit).exec((err,result)=>{
        if (err){
            callback(err,[])
        }else{
            callback(null, result)
        }
    })
}

revisionSchema.statics.numberOfRevisionByRegisteredUser = function(limit, asce, callback) {
    this.aggregate([
        {
            $match:{
                "anon":{$exists: false}
            }
        },
        {
            $group:{
                _id: {"title":"$title", "by": "$user"},
                count: {$sum:1}
            }
        },
        {
            $group:{
                _id: "$_id.title",
                revisedBy: {$sum:1}
            }
        },
        {
            $sort: {revisedBy: asce}
        }
    ], function(err, result){
        if (err){
            callback(err, {})
        }else{
            callback(null, result.slice(0,limit))
        }
    })
}

revisionSchema.statics.age = function (asce, callback) {
    this.aggregate([
        {
            $group:{
                _id: "$title",
                createdAt: {$min: "$timestamp"}
            },
        },
        {
            $sort:{ createdAt: asce }
        },
        { $limit: 2 }
    ]
        , function (err, result) {
            if (err){
                callback(err,{})
            }else{
                callback(null, result)
            }
        })
}

revisionSchema.statics.overallDistribution= function(adminList, botList, byYear, callback) {
    var ref=this // In case "this" is not available in Promise scope
    var ret={}

    var regular={}
    var admin={}
    var anon={}
    var bot={}

    ref.aggregate([
        {$match: {"anon":{$exists: true}}},
        {$group:{
            _id: {$year: "$timestamp"},
            count: {$sum:1}
        }}
    ]).exec().then(function(result){
        ret.anon=result
        return ref.aggregate([
            {$match: {$and:[
                {"user": {$in: botList}},
                {"anon": {$exists: false}}
            ]}},
            {$group:{
                _id: {$year: "$timestamp"},
                count: {$sum:1}
            }}
        ]).exec()
    }).then(function (result){
        ret.bot=result
        return ref.aggregate([
            {$match: {$and:[
                {"user": {$in: adminList}},
                {"anon": {$exists: false}}
            ]}},
            {$group:{
                _id: {$year: "$timestamp"},
                count: {$sum:1}
            }}
        ]).exec()
    })
        .then(function(result){
            ret.admin=result
            return ref.aggregate([
                {$match: {$and:[
                    {"user": {$nin: adminList}},
                    {"user": {$nin: botList}},
                    {"anon": {$exists: false}}
                ]}},
                {$group:{
                    _id: {$year: "$timestamp"},
                    count: {$sum:1}
                }}
            ]).exec()
        })
        .then(function(result){
            ret.regular=result
            var aggregaeted={}
            if (byYear){
                for (let usertype of Object.keys(ret)){
                    for (let record of ret[usertype]){
                        try{
                            aggregaeted[record._id][usertype]
                        }catch(TypeError){
                            aggregaeted[record._id]={}
                        }
                        if (aggregaeted[record._id][usertype]==undefined){
                            aggregaeted[record._id][usertype]=0
                            aggregaeted[record._id][usertype]+=record.count
                        }else{
                            aggregaeted[record._id][usertype]+=record.count
                        }
                    }
                }
            }else{
                for (let usertype of Object.keys(ret)){
                    let tmp=0
                    for (let record of ret[usertype]){
                        tmp+=record.count
                    }
                    aggregaeted[usertype]=tmp
                }
            }
            callback(null, aggregaeted)
        })
        .catch(function(err){
            callback(err, {})
        })
}

revisionSchema.statics.getArticleTitle = function(callback){
    this.distinct("title",function(_, result){
        callback(_, result)
    })
}

revisionSchema.statics.getAuthorNames = function(callback){
    this.distinct("user", {"user":{$ne:null}, "anon": {$exists: false}},function (_,result){
        callback(_, result)
    })
}

revisionSchema.statics.authorInfoByName = function(name, callback){
    var ref=this
    var ret={}

    ref.countDocuments({"user":name}).exec()
        .then(function(result){
            if (result==0){
                throw new Error()
            }
            ret.totalRevision=result
            return ref.aggregate([
                {
                    $match: {"user": name}
                },
                {
                    $group:{
                        _id:"$title",
                        revision_times:{$sum:1},
                        timestamp: {$push:"$timestamp"}
                    }
                },
                {
                    $project:{
                        title: "$_id",
                        timestamp:1,
                        revision_times:1,
                        _id:0
                    }
                }
            ]).exec()
        })
        .then(function(result){
            ret.detail=result
            callback(null, ret)
        }).catch(function(err){
            callback(err,{})
        })
}

revisionSchema.statics.articleInfoByName = function(adminList, botList, article, callback){
    var ref=this
    var ret={}

    ref.countDocuments({"title":article}).exec()
        .then(function(result){
            if (result==0){
                throw new Error()
            }
            ret.count=result
            return ref.aggregate([
                {
                    $match:{ $and:[
                        {"title":article},
                        {"user": {$nin: adminList}},
                        {"user": {$nin: botList}},
                        {"anon": {$exists: false}}
                    ] }
                },
                {
                    $group:{
                        _id: "$user",
                        revision_times: {$sum:1}
                    }
                },
                {
                    $sort:{ "revision_times":-1 }
                },
                {
                    $limit: 5
                }
            ])
        }).then(function(result){
            ret.detail=result
            callback(null, ret)
        }).catch(function(err){
            callback(err,{})
        })
}

revisionSchema.statics.articleYearDistributeByUser= function(adminList, botList, byYear, from, to, article, callback){
    var ref=this // In case "this" is not available in Promise scope
    var ret={}

    var regular={}
    var admin={}
    var anon={}
    var bot={}

    ref.aggregate([
        {$match: {$and:[
            {"anon":{$exists: true}},
            {"title":article}
        ]}},
        {$group:{
            _id: {$year: "$timestamp"},
            count: {$sum:1}
        }}
    ]).exec().then(function(result){
        ret.anon=result
        return ref.aggregate([
            {$match: {$and:[
                {"user": {$in: botList}},
                {"anon": {$exists: false}},
                {"title":article}
            ]}},
            {$group:{
                _id: {$year: "$timestamp"},
                count: {$sum:1}
            }}
        ]).exec()
    }).then(function (result){
        ret.bot=result
        return ref.aggregate([
            {$match: {$and:[
                {"user": {$in: adminList}},
                {"anon": {$exists: false}},
                {"title":article}
            ]}},
            {$group:{
                _id: {$year: "$timestamp"},
                count: {$sum:1}
            }}
        ]).exec()
    })
        .then(function(result){
            ret.admin=result
            return ref.aggregate([
                {$match: {$and:[
                    {"user": {$nin: adminList}},
                    {"user": {$nin: botList}},
                    {"anon": {$exists: false}},
                    {"title":article}
                ]}},
                {$group:{
                    _id: {$year: "$timestamp"},
                    count: {$sum:1}
                }}
            ]).exec()
        })
        .then(function(result){
            ret.regular=result
            var retobj={}
            for (let usertype of Object.keys(ret)){
                retobj[usertype]=[]
                for (let record of ret[usertype]){
                    if (record._id >= from && record._id <=to){
                        retobj[usertype].push(record)
                    }
                }
            }
            ret=retobj
            var aggregaeted={}
            if (byYear){
                for (let usertype of Object.keys(ret)){
                    for (let record of ret[usertype]){
                        try{
                            aggregaeted[record._id][usertype]
                        }catch(TypeError){
                            aggregaeted[record._id]={}
                        }
                        if (aggregaeted[record._id][usertype]==undefined){
                            aggregaeted[record._id][usertype]=0
                            aggregaeted[record._id][usertype]+=record.count
                        }else{
                            aggregaeted[record._id][usertype]+=record.count
                        }
                    }
                }
            }else{
                for (let usertype of Object.keys(ret)){
                    let tmp=0
                    for (let record of ret[usertype]){
                        tmp+=record.count
                    }
                    aggregaeted[usertype]=tmp
                }
            }
            callback(null, aggregaeted)
        })
        .catch(function(err){
            callback(err, {})
        })

}

revisionSchema.statics.userYearlyRevision = function (user, article, from, to, callback){
    this.aggregate([
        {$match: {$and:[
            {"user":user},
            {"title":article}
        ]}},
        {$group:
            {
                _id: {$year: "$timestamp"},
                count: {$sum:1}
            }
        } ]).exec()
        .then(function(result){
            let ret=[]
            if (from && to){
                for (let record of result){
                    if (record._id >= from && record._id<=to){
                        ret.push(record)
                    }
                }
            }else{
                ret=result
            }
            callback(null, ret)
        }).catch(function(err){
            callback(err, {})
        })
}

revisionSchema.statics.getLatestTimestampAndrevid= function (article, callback){
    this.find({title: article})
        .select("revid timestamp -_id")
        .sort({"timestamp":-1})
        .limit(1)
        .exec(function(err, ret){
            callback(null, ret)
        })
}
module.exports=mongoose.model('revisions', revisionSchema)
