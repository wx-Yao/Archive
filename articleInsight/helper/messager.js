'use strict';

// Rejecting error http request with default msg or customized error message
// Funny stuff :p
// Example: new Reject(res, 200, 404).because("My sole is broken").send()
// Or:      new Reject(res, 200, 403).send()

// Assume reject message is always structured:
// { status: <code>, msg: <msg> }

class Reject{
    constructor(res, hstatuscode, statuscode){
        this.response=res
        this.hstatuscode=hstatuscode
        this.statuscode=statuscode
        this.retJSON=this.getDefaultMsg(this.statuscode)
    }

    getDefaultMsg(statuscode){
        return defaultMsg(statuscode)
    }

    // Allow customized error message
    because(reason){
        this.retJSON.msg=reason
        return this
    }

    send(){
        this.response.status(this.hstatuscode).json(this.retJSON)
    }

}

class Accept extends Reject{
    constructor(res, hstatuscode, statuscode){
        super(res, hstatuscode, statuscode)
    }

    append(result){
        this.retJSON.documents=result
        return this
    }

    addAttributes(newobj){
        for (let property of Object.keys(newobj)){
            this.retJSON[property]=newobj[property]
        }
        return this
    }
}


function defaultMsg(statuscode){
    var ret={}
    switch (statuscode){
        case 200:
            ret={"status":statuscode, "msg": "ok"}
            break
        case 401:
            ret={"status":statuscode, "msg": "Authentication failed"}
            break
        case 403:
            ret={"status":statuscode, "msg": "Authentication required to access this endpoint"}
            break
        case 404:
            ret={"status":statuscode, "msg": "Unsupported routing"}
            break
        case 405:
            ret={"status":statuscode, "msg": "Method not supported"}
            break
        case 409:
            ret={"status":statuscode, "msg": "Resource already existed"}
        case 422:
            ret={"status":statuscode, "msg": "Invalid or missing parameters"}
            break
        case 500:
            ret={"status":statuscode, "msg": "Database error. Contact backend developer"}
            break
        default:
            ret={"status":statuscode, "msg": "WARNING! UNHANDDLED CODE"}
    }
    return ret
}

module.exports.reject=Reject
module.exports.accept=Accept
