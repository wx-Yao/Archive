'use strict'

function checkLogin() {
    // check login via cookie:
    let cookies = document.cookie.split(';')
    let ok = false
    for (let i of cookies) {
        if ($.trim(i).startsWith("sessionID")) {
            ok = true
        }
    }
    if (!ok) {
        alert("You're not logged in. Redirected to login page now:")
        $(location).attr("href", 'splash.html');
    }
}

function drawChart(type, tooltip, plotOptions, chart, title, xAxis, series, id) {
    var draw = {}
    if (type === 'pie') {
        draw.tooltip = tooltip
        draw.plotOptions = plotOptions
    } else {
        draw.xAxis = xAxis
    }
    draw.chart = chart
    draw.title = title
    draw.series = series
    id.highcharts(draw)
}

// this beast draw 3 individual graphs
function individualCombo(article, from = null, to = null) {

    checkArticleUpdate(article, (err, needUpdate, updated) => {
        if (err) {
            alert("Wiki API may be broken, try again")
        } else {
            if (needUpdate) {
                $("#update").text('No')
                $("#new_revisions").text(updated)
            } else {
                $("#update").text('Yes')
                $("#new_revisions").text(updated)
            }
        }
    })

    individualDistributionByYearAndType(article, from, to, (err, result) => {
        var chart = { type: 'column', backgroundColor: null }
        var title = { text: "Yearly revision number distribution by user type for article " + article }
        var xAxis = { categories: Object.keys(result).sort(), crosshari: true }
        var plotOptions = {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        }
        var anon = []
        var admin = []
        var regular = []
        var bot = []
        for (let year of Object.keys(result).sort()) {
            admin.push((result[year].admin) ? result[year].admin : 0)
            anon.push((result[year].anon) ? result[year].anon : 0)
            bot.push((result[year].bot) ? result[year].bot : 0)
            regular.push((result[year].regular) ? result[year].regular : 0)
        }
        var series = [
            { name: "Admin", data: admin },
            { name: "Anonymous", data: anon },
            { name: "Bot", data: bot },
            { name: "regular", data: regular }
        ]
        drawChart('bar', null, null, chart, title, xAxis, series, $("#artical_year_bar_container"))
    })


    individualDistributionByYearAndUser(article, from, to, (err, result) => {
        if (err) {

        } else {
            var users = []
            for (let i = 0; i < 5; i++) {
                users.push(Object.keys((result)[i])[0])
            }

            var revisions = []
            for (let u in users) {
                var sum = 0
                for (let j in result[u][users[u]]) {
                    sum += result[u][users[u]][j].count
                }
                revisions.push(sum)
            }

            var total_revision = 0
            for (let revision of revisions) {
                total_revision += revision
            }
            $("#revisions").text(total_revision)


            for (let i in users) {
                $("#name_and_count").append(`<tr>
                                                <td>${users[i]}</td>
                                                <td>${revisions[i]}</td>
                                            </tr>`)
            }
        }
    })


    individualDistributionByType(article, from, to, (err, result) => {
        if (err === 404) {
            $("#tip_individual").text("The article not found!")
        } else if (err === 422){
            $("#tip_individual").text("'From' should be smaller than 'To")
        } else {
            var toDraw = []
            for (let name of Object.keys(result)) {
                toDraw.push([name, result[name]])
            }
            toDraw = toDraw.sort()
            var draw = {}
            var plotOptions = {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            }
            var chart = {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                backgroundColor: null
            }
            var series = [{
                type: "pie",
                name: "share",
                data: toDraw
            }]
            var tooltip = {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            };
            var title = { text: "revision number distribution by user type for article " + article }
            drawChart('pie', tooltip, plotOptions, chart, title, null, series, $("#article_pie_container"))
            $("#tip_individual").text("")
        }

    })



    individualDistributionByYearAndUser(article, from, to, (err, result) => {
        var users = []
        var i
        var j
        var y
        for (i = 0; i < 5; i++) {
            users.push(Object.keys((result)[i])[0])
        }
        var years = new Set()
        for (i in users) {
            var user = result[i][users[i]]
            for (j in user) {
                years.add(user[j]['_id'])
            }
        }
        let years_array = Array.from(years);
        years_array.sort()

        var chart = { type: 'column', backgroundColor: null }
        var title = { text: "Yearly revision number distribution by top 5 users for article " + article }
        var xAxis = { categories: years_array, crosshari: true }
        var plotOptions = {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        }

        var year_count1 = []
        var year_count2 = []
        var year_count3 = []
        var year_count4 = []
        var year_count5 = []

        var id1 = []
        var id2 = []
        var id3 = []
        var id4 = []
        var id5 = []

        var user = result[0][users[0]]
        for (j in user) {
            year_count1[user[j]['_id']] = user[j]['count']
        }

        var user = result[1][users[1]]
        for (j in user) {
            year_count2[user[j]['_id']] = user[j]['count']
        }

        var user = result[2][users[2]]
        for (j in user) {
            year_count3[user[j]['_id']] = user[j]['count']
        }

        var user = result[3][users[3]]
        for (j in user) {
            year_count4[user[j]['_id']] = user[j]['count']
        }

        var user = result[4][users[4]]
        for (j in user) {
            year_count5[user[j]['_id']] = user[j]['count']
        }

        for (y of years_array) {
            id1.push(year_count1.hasOwnProperty(y) ? year_count1[y] : 0)
        }
        for (y of years_array) {
            id2.push(year_count2.hasOwnProperty(y) ? year_count2[y] : 0)
        }
        for (y of years_array) {
            id3.push(year_count3.hasOwnProperty(y) ? year_count3[y] : 0)
        }
        for (y of years_array) {
            id4.push(year_count4.hasOwnProperty(y) ? year_count4[y] : 0)
        }
        for (y of years_array) {
            id5.push(year_count5.hasOwnProperty(y) ? year_count5[y] : 0)
        }

        var series = [
            { name: users[0], data: id1 },
            { name: users[1], data: id2 },
            { name: users[2], data: id3 },
            { name: users[3], data: id4 },
            { name: users[4], data: id5 }
        ]
        drawChart('bar', null, null, chart, title, xAxis, series, $("#article_user_container"))
    })
}

function populateAuthorWithTable(author, documents) {
    let authordiv = $("#author-body")
    let tipsdiv = $("#tips")
    tipsdiv.append(`<h2>${author} (${documents.totalRevision} total revisions)</h2>`)
    // sort by how many times he has revised
    documents.detail = documents.detail.sort(function (a, b) { return (a.revision_times < b.revision_times) ? 1 : ((b.revision_times < a.revision_times) ? -1 : 0); })
    for (let obj of documents.detail) {
        // make date more user-friendly
        for (let index in obj.timestamp) {
            obj.timestamp[index] = obj.timestamp[index].substring(0, 10)
        }
        authordiv.append(`<tr> <td>${obj.title}</td> <td>${obj.revision_times}</td> <td>${obj.timestamp}</td>`)
    }
}



function populateTopTable(number) {
    getTopRevised(-1, number, (err, result) => {
        let toptable = $(".toptable")
        var i = 1
        for (let obj of result) {
            toptable.append(`<tr> <td>${i}</td> <td>${obj._id}</td> <td>${obj.revisionCount}</td>`)
            i++
        }
    })
}


function populateLestTable(number) {
    getTopRevised(1, number, (err, result) => {
        let leasttable = $(".leasttable")
        var i = 1
        for (let obj of result) {
            leasttable.append(`<tr> <td>${i}</td> <td>${obj._id}</td> <td>${obj.revisionCount}</td>`)
            i++
        }
    })

}





$(document).ready(() => {

    checkLogin()

    $('#logout').click(() => {
        $.ajax({
            type: "POST",
            url: "/auth/logout",
            success: function () {
                window.location.href = '/';
            },
            statusCode: {
                422: (response) => {
                    $("#result").text("You're not logged in")
                }
            }
        })
    })


    // overall top revised
    //setTimeout(populateTopNTopRevised(2),0)
    setTimeout(populateTopTable(2), 0)

    // overall least revised
    // setTimeout(populateTopNLeastRevised(2),0)
    setTimeout(populateLestTable(2), 0)

    // disable form submission
    $('form input').on('keypress', function(e) {
    return e.which !== 13;
    });

    // overall adjust threshold number
    $("#btn_getmore").click(() => {
        var number = $("form input[type='number']").val()
        if (number<1){
            alert("The number should be greater than 0")
            return
        }
        $(".toptable").empty()
        $(".leasttable").empty()
        setTimeout(populateTopTable(number), 0)
        setTimeout(populateLestTable(number), 0)
        // setTimeout(populateTopNLeastRevised(number),0) 

    })

    // overall top popularity
    setTimeout(() => {
        getTopPopularity(-1, 1, (err, result) => {
            if (err) {

            } else {
                let spans = $(".popular span.most")
                spans[0].innerHTML = `<b>${result[0]._id}</b>`
                spans[1].innerHTML = `<b>${result[0].revisedBy}</b>`
            }
        })
    }, 0)


    // overall least popularity
    setTimeout(() => {
        getTopPopularity(1, 1, (err, result) => {
            if (err) {

            } else {
                let spans = $(".popular span.least")
                spans[0].innerHTML = `<b>${result[0]._id}</b>`
                spans[1].innerHTML = `<b>${result[0].revisedBy}</b>`
            }
        })
    }, 0)


    // overall top history
    setTimeout(() => {
        getTopHistory(1, (err, result) => {
            if (err) {

            } else {
                let spans = $(".history span.most")
                var i=0
                for (let obj of result) {
                    spans[0].innerHTML += `<b>${obj._id}</b>`
                    spans[1].innerHTML += ` <b>${obj.createdAt.substring(0, 10)}</b> `
                    if (i==0){
                        spans[0].innerHTML += " and "
                        spans[1].innerHTML += " and "
                    }
                    i+=1
                }
            }
        })
    }, 0)


    // overall shortest history
    setTimeout(() => {
        getTopHistory(-1, (err, result) => {
            if (err) {

            } else {
                let spans = $(".history span.least")
                var i=0
                for (let obj of result) {
                    spans[0].innerHTML += `<b>${obj._id}</b>`
                    spans[1].innerHTML += `<b>${obj.createdAt.substring(0, 10)}</b> `
                    if (i==0){
                        spans[0].innerHTML += " and "
                        spans[1].innerHTML += " and "
                    }
                    i+=1
                }
            }
        })
    }, 0)



    // overall yearly distribution drawing
    setTimeout(() => {
        overallUsertypeAndYearDistribution((err, result) => {
            var draw = {}
            var chart = { type: 'column', backgroundColor: null }
            var title = { text: "Yearly revision number distribution by user type" }
            var xAxis = { categories: Object.keys(result).sort(), crosshari: true }
            var plotOptions = {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            }
            var anon = []
            var admin = []
            var regular = []
            var bot = []
            for (let year of Object.keys(result).sort()) {
                admin.push((result[year].admin) ? result[year].admin : 0)
                anon.push((result[year].anon) ? result[year].anon : 0)
                bot.push((result[year].bot) ? result[year].bot : 0)
                regular.push((result[year].regular) ? result[year].regular : 0)
            }
            var series = [
                { name: "Admin", data: admin },
                { name: "Anonymous", data: anon },
                { name: "Bot", data: bot },
                { name: "Regular", data: regular }
            ]
            drawChart('bar', null, null, chart, title, xAxis, series, $("#overall_yearly_container"))
        })
    }, 0)


    // Overall pie chart (user type)
    setTimeout(() => {
        overallUsertypeDistribution((err, result) => {
            var toDraw = []
            for (let name of Object.keys(result)) {
                toDraw.push([name, result[name]])
            }
            toDraw = toDraw.sort()
            var draw = {}
            var plotOptions = {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            }
            var chart = {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                backgroundColor: null,
            }
            var series = [{
                type: "pie",
                name: "share",
                data: toDraw
            }]
            var tooltip = {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            };
            var title = { text: "revision number distribution by user type" }
            drawChart('pie', tooltip, plotOptions, chart, title, null, series, $("#overall_type_container"))
        })
    }, 0)


    getArticleNames((err, result) => {
        var options = {
            data: [],
            list: {
                match: {
                    enabled: true
                }
            }
        };
        options.data = result;
        $("#articles").easyAutocomplete(options);
    })

    // Draw example graph of article Austrlia
    setTimeout(() => {
        individualCombo("Australia")
    }, 0)


    // Author stats exmple using user "Tavix"
    setTimeout(() => {
        getAuthorStats("Tavix", (err, result) => {
            if (err == 404) {
                $("#author-serach-container span").text("Author Tavix not found. Database may use a new dataset.")
            } else {
                $("#author-body").empty()
                populateAuthorWithTable("Tavix", result)
            }
        })
    }, 0)

    $("#author-search").click(() => {
        let name = $.trim($("#author-search-box").val())
        $("#author-serach-container span").text("")
        getAuthorStats(name, (err, result) => {
            if (err == 404) {
                $("#author-serach-container span").text(result)
            } else {
                $("#author-body").empty()
                populateAuthorWithTable(name, result)
            }
        })
    })

    $("#btn_articles").click(() => {
        let article = $("#articles").val()
        let from = $("#from").val()
        let to = $("#to").val()
        if (parseInt(from) >= parseInt(to)){
            $("#tip_individual").text("Invalid time span")
            return
        }
        $("#name_and_count").empty()
        individualCombo(article, from, to)
    })



    $("#switch").click(() => {
        if ($("#overall_yearly_container").is(":hidden")) {
            $("#overall_yearly_container").attr("hidden", false)
            $("#overall_type_container").attr("hidden", true)
        } else {
            $("#overall_yearly_container").attr("hidden", true)
            $("#overall_type_container").attr("hidden", false)
        }
    })


    $("#individual_selection").change(function () {
        var selected = $(this).children("option:selected").val();
        if (selected === 'distribution_user') {
            $("#article_pie_container").attr("hidden", false)
            $("#artical_year_bar_container").attr("hidden", true)
            $("#article_user_container").attr("hidden", true)
        } else if (selected === 'distribution_year_user') {
            $("#article_pie_container").attr("hidden", true)
            $("#artical_year_bar_container").attr("hidden", false)
            $("#article_user_container").attr("hidden", true)
        } else {
            $("#article_pie_container").attr("hidden", true)
            $("#artical_year_bar_container").attr("hidden", true)
            $("#article_user_container").attr("hidden", false)
        }
    });

})
