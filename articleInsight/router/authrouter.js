'use strict';

var express=require("express")
var router=express.Router()
var validator=require('validator')

var Reject=require('../helper').messager.reject
var services=require('../services')

router.post("/signup",(req,res,next)=>{
    if (!(req.body.firstName && req.body.lastName && req.body.email  && req.body.password && validator.isEmail(req.body.email))){
        new Reject(res, 422, 422).send()
    }else{
        next()
    }
},services.auth.signup)

router.post("/login", (req, res, next)=>{
    if (!(req.body.username && req.body.password && validator.isEmail(req.body.username))){
        new Reject(res, 422, 422).send()
    }else{
        next()
    }
},services.auth.login)

router.post("/logout",services.auth.logout)

module.exports=router
