const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

window.onload = refreshPage; // Refresh home page as soon as page loads.

var targetName = document.getElementsByClassName("accountName");
var targetNumber = document.getElementsByClassName("accountNumber");
var targetBalance = document.getElementsByClassName("balance");

var extension = "" //initially used for call for account on load, used after for POST 
if (localStorage.getItem("accountNumber") != "undefined") {
    extension = "?accountNumber=" + localStorage.getItem("accountNumber");
} else {
    extension = "?name=" + localStorage.getItem("name");
}

async function parseJSONObject(type, callType) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    return new Promise((resolve, reject) => {
        const apiUrl = url + "/api/"+ callType + extension;
        fetch(apiUrl, {
            cache: 'no-cache',
            method: type,
        })
            .then((response) => response.json())
            .then((data) => {
                if(data) {
                    userObject = data[0];
                    resolve(userObject);
                }
            })
    })
}

var button = document.getElementById("sendButton");
button.onclick = async function sendMoneyClick() {

    var recipientInput = document.getElementById("recipient");
    var amountInput = document.getElementById("amount");
    var referenceInput = document.getElementById("reference");

    var greenscore = 0;

    extension = "?accountNumber=" + recipientInput.value;
    const greenscoreObject = await parseJSONObject("GET", "accounts");

    if(greenscoreObject?.carbonEmissionRating != null) {     //if carbonEmissionRating is not null then set greenscore to company rag
        greenscore = greenscoreObject.rag;
    }

    extension = "/"+localStorage.getItem("accountNumber") +"/"
                + recipientInput.value +"/"
                + amountInput.value +"/"
                + greenscore +"/"
                + referenceInput.value;
    const object = await parseJSONObject("POST", "transactions");
    if(object != null) {
        launchDialog(object);
    }
}

async function refreshPage() {
    hideMainHomePage();
    setTimeout(() => { showMainHomePage() }, 1500);
    const object = await parseJSONObject("GET", "accounts")

    targetName[0].innerText = object.name; // Change name within the document
    targetNumber[0].innerText = "Account number: " + object.accountNumber; // Change account number within the document
    targetBalance[0].innerText = "£" + (Math.round(object.amountOfMoney * 100) / 100).toFixed(2);; // Change balance within the document
}


function tryAgain() {
    const wrongRecipient = document.getElementById('wrongRecipient');
    wrongRecipient.close();
}

function launchDialog(message) {
    const d = document.getElementById('wrongRecipient');
    const text = document.getElementById('popupErorrMessage');
    wrongRecipient.showModal();
}

// Hides main content while API fetch completes, instead showing a loader
function hideMainHomePage() {
    document.getElementsByClassName("full")[0].style.visibility = 'hidden';
    document.getElementsByClassName("loader")[0].style.visibility = 'visible';
}

// Shows main content (intended after fetch completes), and hides loader
function showMainHomePage() {
    document.getElementsByClassName("full")[0].style.visibility = 'visible';
    document.getElementsByClassName("loader")[0].style.visibility = 'hidden';
}