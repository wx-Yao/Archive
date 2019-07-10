'use strict';

var validator=require('validator')

var utility=require('../helper')
var Reject=utility.messager.reject
var Accept=utility.messager.accept
var models=require('../db')

/*
 * Feature implemented: Signup
 */
module.exports.signup = (req,res) => {
    let userobj={
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    }
    models.user.createUser(userobj, (err, success)=>{
        if (err){
            new Reject(res, 409, 409).because("Email already existed").send()
            return
        }
        if (success){
            new Accept(res, 200, 200).send()
        }
    })
}

/*
 * Feature implemented: Login, session management
 * login handler defines the session object.
 * session object has such properties
 * session.username: the email bound to the seession 
 * session.authenticated: true/false
 */
module.exports.login= (req,res) => {
    let username=req.body.username
    let password=req.body.password
    models.user.authenticate(username, password, (err, success)=> {
        if (success){
            req.session.username=username
            req.session.authenticated=true
            new Accept(res, 200, 200).because("Auth succeeded").send()
        }else{
            new Reject(res, 401, 401).send()
        }
    })
}

/*
 * Feature implemented: Logout
 */
module.exports.logout= (req,res) => {
    if (req.session.authenticated){
        req.session.destroy()
        res.clearCookie('sessionID')
        new Accept(res, 200, 200).send()
    }else{
        new Reject(res, 422, 422).because("You're not logged in").send()
    }
}
