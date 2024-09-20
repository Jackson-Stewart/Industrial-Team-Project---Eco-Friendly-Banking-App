const url = "https://zw829ww08l.execute-api.us-east-1.amazonaws.com/default";

window.onload = refreshDetails;
var targetName = document.getElementsByClassName("accountName");
var targetNumber = document.getElementsByClassName("accountNumber");
var targetBalance = document.getElementsByClassName("balance");
var targetPointsRemaining = document.getElementsByClassName("pointsRemainingToNextLevel");
var targetLevels = document.getElementsByClassName("currentLevel");

function parseJSONObject(type) {
    // Call API, get requested content and change into JSON object
    var userObject = '';
    switch (type) {
        case "Account":
            const apiUrl = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com/api?accountNumber=1";

            fetch(apiUrl, {
                method: 'GET',
            })
                .then((response) => response.json())
                .then((data) => {
                    userObject = data[0].name
                    return userObject;
                })
                .catch((error) => {
                    console.error(error);
                });
            break;
        case "Company":
            // TODO
            break;
        case "Transaction":
            // TODO
            break;
        default:
            return false;
    }
}

function parseAccountDetails() {
    // Take JSON object
    let obj = parseJSONObject("Account");
    console.log(obj);
    // if (obj === '') {
    //     console.log(obj);
    //     return -1;
    // }

    // Return details of user
    return obj;
}

function calculateLevel(score) {
    // STREAK IGNORED, SHOULD BE FACTORED INTO CALCULATION SOON

    let remaining = 0;
    // (Level/0.3)^2 is boundary
    for (let level = 0; level < 10; level++) {
        // if greenscore is below boundary, then that is the level to be assigned.
        let boundary = Math.pow(level / 0.3, 2);
        if (score < boundary) {
            remaining = boundary - score;
            return [level, remaining];
        }
        else continue;
    }
}

// Simply refreshes the home page for account number 1. This will soon be split off
// into separate functions because it's super ugly now.
function refreshDetails() {
    //let userObject = parseAccountDetails();
    //console.log(userObject); // NOT WORKING.... I will finish this.

    const apiUrl = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com/api?accountNumber=1";

    fetch(apiUrl, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((data) => {
            let name = data[0].name;
            let number = data[0].accountNumber;
            let balance = data[0].amountOfMoney;
            let greenScore = data[0].currentGreenScore;

            targetName[0].innerText = name; // Change name within the document
            targetNumber[0].innerText = "Account number: " + number; // Change account number within the document
            targetBalance[0].innerText = "£" + balance; // Change balance within the document

            // Calculate current level and points remaining until next level
            let values = calculateLevel(greenScore);

            // Change all the level elements
            for (var i = 0; i < targetLevels.length; i++) {
                targetLevels[i].innerText = "Level " + values[0];
            }
            document.getElementsByClassName("nextLevel")[0].innerText = "Level " + (values[0] + 1);
            targetPointsRemaining[0].innerText = Math.round(values[1]);
        })
        .catch((error) => {
            console.error(error);
        });
}
