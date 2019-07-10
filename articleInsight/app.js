'use strict';

// standard module import
var express=require('express')
var session=require('express-session')
var path=require('path')
var http=require('http')
var helmet=require('helmet')

// customized module import
var utility=require('./helper')
var router=require('./router')

var app=express()

// app configuration
app.set('etag','strong')
app.set('port',3000)
app.disable("x-powered-by")
utility.parseName((err, result)=>{
    app.locals.admin=result.admin
    app.locals.bot=result.bot
})
// middleware definition
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(session({
    secret: utility.randomString(), // 32 bytes random hex
    name: "sessionID",
    saveUninitialized : false,
    resave: true,
    rolling: true,
    cookie:{ maxAge: 600000 , httpOnly:false} // 10 mins. Set to false because the front end needs to know if a user is logged in
}))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// routes everything. Refer to router/index/js for details
app.use("/",router)

var server=http.createServer(app)
server.listen(app.get('port'),function(){
    console.log("Application server listening on port 3000...")
})

module.exports=app
