var nameInput = document.getElementById("nameInput");
var registerButton = document.getElementById("registerButton");
var backButton = document.getElementById('backButton');
var text = document.getElementsByClassName("registeredText");
var input = document.getElementById("nameInput");

const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

localStorage.setItem("accountNumber", "undefined");
localStorage.setItem("name", "undefined");

// Set text, send POST request, then set new user's accountNumber to localstorage, then redirect
registerButton.onclick = async function () {
    text[0].innerText = "Registering " + input.value + "...";
    const object = await createNewAccount(input.value)
    localStorage.setItem("name", object.name);
    console.log(object.name);
    window.location.href = "home.html"; 
};

backButton.addEventListener('click', function () {
    window.location.href = "login.html";
});

function createNewAccount(name) {
    let userObject = '';
    return new Promise((resolve, reject) => {
        const apiUrl = url + "/api/" + name;
        fetch(apiUrl, {
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                userObject = data[0];
                resolve(userObject);
            })
            .finally(() => {
                console.log('Promise settled.');
            });
    })
}