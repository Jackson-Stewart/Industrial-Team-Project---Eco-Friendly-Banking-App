const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

var getExtension = ""

async function parseJSONObject(type) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    return new Promise((resolve, reject) => {
        const apiUrl = url + "/api/transaction?" + getExtension;
        fetch(apiUrl, {
            cache: 'no-cache',
            method: type,
        })
            .then((response) => response.json())
            .then((data) => {
                userObject = data[0];
                resolve(userObject);
            })
    })
}

async function sendMoneyClick() {
    var recipientInput = document.getElementById("recipient");
    var amountInput = document.getElementById("amount");
    var referenceInput = document.getElementById("reference");
    
    getExtension = "accountNumber=" + recipientInput;
    const greenscoreObject = await parseJSONObject("GET"); //GREENSCORE
    
    getExtension = "accountNumberFrom=" + localStorage.get("accountNumber")
                + "&accountNumberTo=" + recipientInput
                + "&amount=" + amountInput
                + "&calculatedGreenScore=" + greenscoreObject.greenscore
                + "&reference=" + referenceInput;
    const object = await parseJSONObject("POST");
    if(object != null) {
        launchDialog();
    }
}

function tryAgain() {
    const wrongRecipient = document.getElementById('wrongRecipient');
    wrongRecipient.close();
}

function launchDialog() {
    const d = document.getElementById('wrongRecipient');
    wrongRecipient.showModal();
}