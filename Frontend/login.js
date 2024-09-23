var loginPageInput = document.getElementById("loginAccountNumberInput");
var loginPageButton = document.getElementById("loginButton");

loginPageButton.addEventListener('click',function(){
    localStorage["accountNumber"] = loginPageInput;
    window.location.href = "home.html";
});