'use strict';

var express=require('express')

var Reject = require("../helper").messager.reject
var authRouter= require('./authrouter.js')
var statisticsRouter=require('./statisticsrouter.js')

var router=express.Router()

// landing page
router.get("/",(req,res)=>{
    res.redirect("/splash.html")
})

// Restrict statistic function availability to guest user
// And only GET is allowed
router.use("/statistics", 
    (req, res, next)=>{
    if (!req.session.authenticated){
        new Reject(res, 403, 403).send()
    }else{
        next()
    }
    },  (req, res, next)=>{
        if (req.method!="GET"){
            new Reject(res, 405, 405).send()
        }else{
            next()
        }
    }, statisticsRouter)

router.use('/auth',(req, res, next)=>{
        if (req.method!="POST"){
            new Reject(res, 405, 405).send()
        }else{
            next()
        }
},authRouter)

// handle unsupported mapping
router.use((req,res)=>{
    new Reject(res, 404, 404).send()
})

module.exports=router
