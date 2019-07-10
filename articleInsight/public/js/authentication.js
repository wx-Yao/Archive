'use strict';

function clearForm() {
    $("#result").text("")
    $("input").val("")
}

function toggleSignupAndLogin() {
    clearForm()
    if ($("#loginContainer").is(":hidden")) {
        $("#loginContainer").attr("hidden", false)
        $("#signUpContainer").attr("hidden", true)
    } else {
        $("#loginContainer").attr("hidden", true)
        $("#signUpContainer").attr("hidden", false)
    }
}

$(document).ready(function () {
    // login logic
    $("#loginAction").click(function () {
        var username = $("#email").val()
        var password = $("#password").val()
        if (!(username && password)) {
            $("#result").text("Please give complete information")
            return
        }
        var payload = {
            "username": username,
            "password": password
        }
        $.ajax({
            type: "POST",
            url: "/auth/login",
            data: payload,
            success: function (data) {
                window.location.href = '/presentation.html';
            },
            statusCode: {
                422: (response) => {
                    $("#result").text("Please use valid email")
                },
                401: (response) => {
                    $("#result").text("Authentication Failed")
                }
            }
        })
    })


    $("#loginSwitch").click(function () {
        toggleSignupAndLogin()
        //$("#result").text("")
        //$("input").val("")
        if ($("#loginContainer").is(":hidden")) {
            $("#loginSwitch").text("<< Go Back")
        } else {
            $("#loginSwitch").text("Sign Up Here!")
        }
    })

    // signup logic
    $("#signUpAction").click(function () {
        var firstName = $("#firstName").val()
        var lastName = $("#lastName").val()
        var email = $("#email2").val()
        var password = $("#password2").val()
        var payload = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        }
        console.log(payload)
        $.ajax({
            type: "POST",
            url: "auth/signup",
            data: payload,
            statusCode: {
                200: () => {
                    toggleSignupAndLogin()
                    $("#result").text("Register success! You can login now")
                },
                422: () => {
                    $("#result").text("Please use valid Email")
                },
                409: () => {
                    $("#result").text("Email taken. Please try another")
                }
            }
        })
    })

})
