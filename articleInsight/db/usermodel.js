'use strict';

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
var validator = require('validator')

const ROUND=10

var userSchema = new Schema({
    email: {type: String, required: true, unique: true, index: true,  validate: (mail)=> {return validator.isEmail(mail)}},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    pwdhash: {type: String, required: true}
}, {strict: true, versionKey: false})

userSchema.statics.authenticate = function(email, pwd, callback){
    this.findOne({"email": email},'pwdhash', function (err, result){
        if (err){
            callback(err, false)
            return
        }
        if (result==null) {
            callback(null, false)
            return
        }
        bcrypt.compare(pwd,result.pwdhash,(err,match)=>{
            callback(null, match)
        })
    })
}

// TODO: security concern about brute forcing email space.
userSchema.statics.checkEmail = function(email, callback){
    this.countDocuments({"email":email}, function(_, result){
        var existed = (result==0)? false: true
        callback(null, existed)
    })
}

userSchema.statics.createUser= function(userobj, callback){
    let hash=bcrypt.hashSync(userobj.password, ROUND)
    var newUser= new this({
        "email": userobj.email,
        "lastName": userobj.lastName,
        "firstName": userobj.firstName,
        "pwdhash": hash
    })
    newUser.save( (err,_)=>{
        if (err){
            callback(err,false)
        }else{
            callback(null, true)
        }
    })
}

module.exports=mongoose.model('user',userSchema)
