'use strict'

function getTopRevised(asce, limit, callback) {
    var count = (limit) ? parseInt(limit) : 1
    $.ajax({
        type: "GET",
        url: "/statistics/overall/toprevised",
        data: { "asce": asce, "limit": count },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            }
        }
    })
}

function getTopPopularity(asce, limit, callback) {
    var count = (limit) ? parseInt(limit) : 2
    $.ajax({
        type: "GET",
        url: "/statistics/overall/popularity",
        data: { "asce": asce, "limit": count },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            }
        }
    })
}

function getTopHistory(asce, callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/overall/history",
        data: { "asce": asce },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            }
        }
    })
}

function overallUsertypeDistribution(callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/overall/distribution",
        data: { "byType": 1, "byYear": 0 },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            }
        }
    })
}

function overallUsertypeAndYearDistribution(callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/overall/distribution",
        data: { "byType": 1, "byYear": 1 },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            }
        }
    })
}

function getAuthorStats(author, callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/author/stats",
        data: { "author": author },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            }
        }
    })
}


function getArticleNames(callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/article/names",
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            },
        }
    })
}

function getArticleStats(article, callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/article/stats",
        data: { "article": article },
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            }
        }
    })
}

function checkArticleUpdate(article, callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/article/update",
        data: { "article": article },
        statusCode: {
            200: (response) => {
                callback(null, response.needUpdate, response.updated)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            },
            500: (xhr) => {
                callback(500, xhr.responseJSON.msg)
            }
        }
    })
}

function individualDistributionByYearAndType(article, from, to, callback) {
    var payload = {
        article: article,
        byType: 1,
        byYear: 1,
        byUser: 0
    }
    if (from && to) {
        payload.from = from
        payload.to = to
    }
    $.ajax({
        type: "GET",
        url: "/statistics/article/distribution",
        data: payload,
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            },
        }
    })
}


function individualDistributionByType(article, from, to, callback) {
    var payload = {
        article: article,
        byType: 1,
        byYear: 0,
        byUser: 0
    }
    if (from && to) {
        payload.from = from
        payload.to = to
    }
    $.ajax({
        type: "GET",
        url: "/statistics/article/distribution",
        data: payload,
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            },
        }
    })
}


function individualDistributionByYearAndUser(article, from, to, callback) {
    var payload = {
        article: article,
        byType: 0,
        byYear: 1,
        byUser: 1
    }
    if (from && to) {
        payload.from = from
        payload.to = to
    }
    $.ajax({
        type: "GET",
        url: "/statistics/article/distribution",
        data: payload,
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            },
            422: (xhr) => {
                callback(422, xhr.responseJSON.msg)
            },
            404: (xhr) => {
                callback(404, xhr.responseJSON.msg)
            },
        }
    })
}



function getAuthorNames(callback) {
    $.ajax({
        type: "GET",
        url: "/statistics/author/names",
        statusCode: {
            200: (response) => {
                callback(null, response.documents)
            }
        }
    })
}

/*$(document).ready(()=>{
    console.log("below is the result for overall, feature 1")
    getTopRevised(-1)
    console.log("below is the result for overall, feature 2")
    getTopRevised(1)
    console.log("below is the result for overall, feature 3")
    getTopRevised(-1, 5)
    console.log("below is the result for overall, feature 4")
    getTopPopularity(-1)
    console.log("below is the result for overall, feature 5")
    getTopPopularity(1)
    console.log("below is the result for overall, feature 6")
    getTopHistory(-1)
    console.log("below is the result for overall, feature 7")
    getTopHistory(1)
    console.log("below is the result for overall, feature 8")
    overallUsertypeAndYearDistribution()
    console.log("below is the result for overall, feature 9")
    overallUsertypeDistribution()


    console.log("below is the result for individual, feature 1, 2, 3")
    getArticleStats("India")
    console.log("below is the result for individual, feature 4")
    individualDistributionByYearAndType("India")
    console.log("below is the result for individual, feature 5")
    individualDistributionByType("India")
    console.log("below is the result for individual, feature 6")
    individualDistributionByYearAndUser("India")


    console.log("below is the result for author, feature 1, 2")
    getAuthorStats("SOMEUSER")
})*/
