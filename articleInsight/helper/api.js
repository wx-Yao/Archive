'use strict';

var request=require('request')

// API fetch
module.exports = (title, after, callback)=>{
    var ret=[]
    var params={
        action: "query",
        prop: "revisions",
        titles: title,
        rvprop: "ids|timestamp|user|sha1|userid|size",
        rvdir: "newer",
        rvstart: after,
        format: "json",
        rvlimit: "max"
    }

    var endpoint="https://en.wikipedia.org/w/api.php"
    request({url: endpoint, qs: params},(err, res, body)=>{
        if (err || res.statusCode!=200){
            callback(err,ret)
            return
        }
        // for now we dont handle the wiki API's response error. We assume they are pretty stable
        // ignore response status code
        body=JSON.parse(body)
        var pages=body.query.pages
        for (let page of Object.keys(pages)){
            Array.prototype.push.apply(ret, pages[page].revisions)
        }
        // Empty response from wiki, which means no update
        if (ret[0]==undefined){
            callback(null, [])
            return
        }
        callback(null, ret)
    })
}
