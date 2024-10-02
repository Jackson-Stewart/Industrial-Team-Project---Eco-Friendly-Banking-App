const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

var loginPageInput = document.getElementById("loginAccountNumberInput");
var loginPageButton = document.getElementById("loginButton");
var registerButton = document.getElementById("registerButton");
var signingInText = document.getElementsByClassName("signingInText");

localStorage.setItem("accountNumber", "undefined");
localStorage.setItem("name", "undefined");

loginPageButton.addEventListener('click', function () {
    if(loginPageInput.value === "admin") {
        window.location.href = "admin.html";
    }
    localStorage["accountNumber"] = loginPageInput.value;

    checkAccountExists();
});

registerButton.addEventListener('click', function () {
    window.location.href = "register.html";
});

async function checkAccountExists() {
    if (loginPageInput.value === "") {
        return signingInText[0].innerText = "Please enter an account number.";
    }
    signingInText[0].innerText = "Attempting sign in...";
    let signInPromise = new Promise((resolve, reject) => {
        const apiUrl = url + "/api?accountNumber=" + loginPageInput.value;
        fetch(apiUrl, {
            cache: 'no-cache',
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                if (Object.keys(data).length === 0) {
                    reject();
                }
                else { resolve(); }
            })
    })
    signInPromise.then((success) => { window.location.href = "home.html"; },
        (fail) => { signingInText[0].innerText = "Sign in failed. Check if your account number is correct and try again."; });
}