const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

window.onload = refreshHomePage; // Refresh home page as soon as page loads.

var targetName = document.getElementsByClassName("accountName");
var targetNumber = document.getElementsByClassName("accountNumber");
var targetBalance = document.getElementsByClassName("balance");
var targetPointsRemaining = document.getElementsByClassName("pointsRemainingToNextLevel");
var targetLevels = document.getElementsByClassName("currentLevel");

async function parseJSONObject(type) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    switch (type) {
        case "Account":
            return new Promise((resolve, reject) => {
                const apiUrl = url + "/api?accountNumber=" + localStorage["accountNumber"];

                setTimeout(() => {
                    fetch(apiUrl, {
                        cache: 'no-cache',
                        method: 'GET',
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            userObject = data[0];
                            resolve(userObject);
                        })
                })
            })
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

// calculateLevel: calculates user's level, given the current numeric score
function calculateLevel(score) {
    // STREAK IGNORED, SHOULD BE FACTORED INTO CALCULATION SOON

    let remaining = 0;
    // (Level/0.3)^2 is boundary
    for (let level = 0; level < 10; level++) {
        // If greenscore is below boundary, then that is the level to be assigned.
        let boundary = Math.pow(level / 0.3, 2);
        if (score < boundary) {
            remaining = boundary - score;
            return [level, remaining];
        }
        else continue;
    }
}

// calculateCompanyGreenLevel: calculates the numeric RAG rating to 2 decimals
// Ensure total is the sum of the carbon emission, sustainability and waste practices score
function calculateCompanyGreenLevel(score) {
    divided = score / 30;
    return Math.round((divided + Number.EPSILON) * 100) / 100; // Rounds to 2 decimals
}

// Hides main content while API fetch completes, instead showing a loader
function hideMainHomePage() {
    document.getElementsByClassName("full")[0].style.visibility='hidden';
    document.getElementsByClassName("loader")[0].style.visibility='visible';
}

// Shows main content (intended after fetch completes), and hides loader
function showMainHomePage() {
    document.getElementsByClassName("full")[0].style.visibility='visible';
    document.getElementsByClassName("loader")[0].style.visibility='hidden';
}

// Refreshes the home page for current account details, and sets appropriate text.
// It's a bit slow... Should look at this again soon to understand why.
// Show loading page for 2 seconds before displaying actual page.
async function refreshHomePage() {
    hideMainHomePage();
    setTimeout(() => {showMainHomePage()}, 1500);
    const object = await parseJSONObject('Account')

    targetName[0].innerText = object.name; // Change name within the document
    targetNumber[0].innerText = "Account number: " + object.accountNumber; // Change account number within the document
    targetBalance[0].innerText = "£" + object.amountOfMoney; // Change balance within the document

    // Calculate current level and points remaining until next level
    let values = calculateLevel(object.currentGreenScore);

    // Change all the level elements
    for (var i = 0; i < targetLevels.length; i++) {
        targetLevels[i].innerText = "Level " + values[0];
    }

    document.getElementsByClassName("nextLevel")[0].innerText = "Level " + (values[0] + 1);
    targetPointsRemaining[0].innerText = Math.round(values[1]);
}