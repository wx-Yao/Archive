'use strict'

var mongoose=require('mongoose')
var userModel=require('./usermodel.js')
var revisionModel=require('./revisionmodel.js')

try{
    var dbcrendential=require('../dbcredential.json')
}
catch (e) {
    if (e.code=='MODULE_NOT_FOUND'){
        console.log("Remote database crendential not found. Assume localhost with no credentials.")
        var dbcrendential={}
        dbcrendential.database="comp5347"
    }
}

var connectionString=""
if ("username" in dbcrendential){
    connectionString=`mongodb://${dbcrendential.username}:${dbcrendential.password}@${dbcrendential.host}:${dbcrendential.port}/${dbcrendential.authenticationDatabase}`
}else{
    connectionString=`mongodb://localhost/${dbcrendential.database}`
}

mongoose.set('useCreateIndex', true)
mongoose.connect(connectionString,{ useNewUrlParser: true }, (err)=> {
    if (err){
        console.log("DB connection failed. exit")
        process.exit(1)
    }else{
        console.log("DB connection established.")
    }
})

var models={
    user: userModel,
    revision: revisionModel
}

module.exports=models
