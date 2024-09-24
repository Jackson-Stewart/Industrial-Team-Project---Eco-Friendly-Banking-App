var loginPageInput = document.getElementById("loginAccountNumberInput");
var loginPageButton = document.getElementById("loginButton");
var registerButton = document.getElementById("registerButton");

localStorage.setItem("accountNumber", "undefined");
localStorage.setItem("name", "undefined");

loginPageButton.addEventListener('click',function(){
    localStorage
    localStorage["accountNumber"] = loginPageInput.value;
    window.location.href = "home.html";
});

registerButton.addEventListener('click',function(){
    window.location.href = "register.html";
});