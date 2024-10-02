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
        console.log(apiUrl);
        fetch(apiUrl, {
            cache: 'no-cache',
            method: type,
        })
            .then((response) => response.json())
            .then((data) => {
                if(type ==="POST") {

                    userObject = data;
                }
                else {
                    userObject = data[0];
                }
                resolve(userObject);
            })
    })
}

// Update green score (separated from transaction)
async function updateGreenScore(amount, accountNumberFrom, rag) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    return new Promise((resolve, reject) => {
        const apiUrl = url + "/api/updateGreenScore/" + amount + "/" + accountNumberFrom + "/" + rag;
        console.log(apiUrl);
        fetch(apiUrl, {
            cache: 'no-cache',
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Green score response: " + data[0]);
                userObject = data;
                resolve(userObject);
            })
    })
}

var button = document.getElementById("sendButton");
button.onclick = async function sendMoneyClick() {
    hideMainHomePage();

    var recipientInput = document.getElementById("recipient");
    var amountInput = document.getElementById("amount");
    var referenceInput = document.getElementById("reference");

    var greenscore = 0;

    extension = "?accountNumber=" + recipientInput.value;
    const greenscoreObject = await parseJSONObject("GET", "accounts");

    if(greenscoreObject?.carbonEmissionRating != null) {     //if carbonEmissionRating is not null then set greenscore to company rag
        greenscore = greenscoreObject.rag;
    }

    extension = "/"+localStorage.getItem("accountNumber")+"/"
                + recipientInput.value +"/"
                + amountInput.value +"/"
                + greenscore +"/"
                + referenceInput.value;
    const object = await parseJSONObject("POST", "transactions");
    const updateScore = updateGreenScore(amountInput.value, localStorage.getItem("accountNumber"), greenscore)
    // Upon returning to home page, do a delay on showing of green level to simulate analysis
    localStorage.setItem("delayShowingLevel", "True");

    showMainHomePage();
    if(object !== null) {
        launchDialog(object.message, "wrongRecipient");
        return;
    }
    launchDialog("", "sentMoneySuccessful");
}

async function refreshPage() {
    hideMainHomePage();
    const object = await parseJSONObject("GET", "accounts")

    if ((object))
    {
        showMainHomePage()
    }

    targetName[0].innerText = object.name; // Change name within the document
    targetNumber[0].innerText = "Account number: " + object.accountNumber; // Change account number within the document
    targetBalance[0].innerText = "£" + (Math.round(object.amountOfMoney * 100) / 100).toFixed(2);; // Change balance within the document
}

var tryAgainButton = document.getElementById("tryAgainButton");
tryAgainButton.onclick = function tryAgain() {
    const wrongRecipient = document.getElementById('wrongRecipient');
    wrongRecipient.close();
};

function launchDialog(message, popupId) {
    const d = document.getElementById(popupId);
    if(popupId == "wrongRecipient") {
        const text = document.getElementById('popupErrorMessage');
        text.innerText = message;
    }
    d.showModal();
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
