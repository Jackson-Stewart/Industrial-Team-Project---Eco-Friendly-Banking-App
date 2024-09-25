const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

function tryAgain() {
    const wrongRecipient = document.getElementById('wrongRecipient');
    wrongRecipient.close();
}

function launchDialog() {
    const d = document.getElementById('wrongRecipient');
    wrongRecipient.showModal();
}

async function postTransaction(type) {      //api url needs changed
    let userObject = '';
    return new Promise((resolve, reject) => {
        const apiUrl = url + "/api" + getExtension;
        fetch(apiUrl, {
            cache: 'no-cache',
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                userObject = data[0];
                resolve(userObject);
            })
    })        
}