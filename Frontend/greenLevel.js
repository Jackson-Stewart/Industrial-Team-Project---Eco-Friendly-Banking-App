const url = 'https://efnn495zpi.execute-api.us-east-1.amazonaws.com';

window.onload = refreshRewardsPage;

var targetNumber = document.getElementsByClassName('accountNumber');
var targetGreenScore = document.getElementsByClassName('greenScore');
var targetLevel = document.getElementsByClassName('currentLevel');
var targetPointsRemaining = document.getElementsByClassName("pointsRemainingToNextLevel");
var targetLevelBar = document.getElementsByClassName('levelBar');
var targetStreakLevel = document.getElementsByClassName('streakLevel');

var getExtension = "";
if (localStorage.getItem("accountNumber") != "undefined") {
    getExtension = "?accountNumber=" + localStorage.getItem("accountNumber");
} else {
    getExtension = "?name=" + localStorage.getItem("name");
}

function append(parent, el) {
    return parent.appendChild(el);
}

async function parseJSONObject(type) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    let allUsers = [];

    switch(type){
        case "Account":
            return new Promise((resolve, reject) => {
                const apiUrl = url + "/api" + getExtension;
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
            break;
    }
}

// Hides main content while API fetch completes, instead showing a loader
function hideMainPage() {
    document.getElementsByClassName("full")[0].style.visibility = 'hidden';
    document.getElementsByClassName("loader")[0].style.visibility = 'visible';
}

// Shows main content (intended after fetch completes), and hides loader
function showMainPage() {
    document.getElementsByClassName("full")[0].style.visibility = 'visible';
    document.getElementsByClassName("loader")[0].style.visibility = 'hidden';
}

async function refreshRewardsPage() {
    hideMainPage();
    const accountObject = await parseJSONObject('Account');

    if ((accountObject))
    {
        showMainPage()
    }

    targetNumber[0].innerText = "Account number: " + accountObject.accountNumber; // Change account number within the document
    //targetGreenScore[0].innerText = accountObject.currentGreenScore;
    let values = calculateLevel(accountObject.currentGreenScore);
    targetStreakLevel[0].innerText = localStorage['streak'];

    targetLevel[0].innerText = values[0];
    targetLevelBar[0].classList.add('w-['+values[2]+'%]')

    if (values[0] == 10) {
        document.getElementsByClassName("nextLevel")[0].innerText = "";
        document.getElementsByClassName("fullLevelText")[0].innerText = "Max Level Reached!";
    }
    else
    {
        document.getElementsByClassName("nextLevel")[0].innerText = (values[0] + 1);
        targetPointsRemaining[0].innerText = Math.round(values[1]);
    }
}

// calculateLevel: calculates user's level, given the current numeric score
function calculateLevel(score) {
    // STREAK IGNORED, SHOULD BE FACTORED INTO CALCULATION SOON

    let remaining = 0;
    var boundary = 0;
    // (Level/0.3)^2 is boundary
    for (let level = 0; level < 10; level++) {
        // If greenscore is below boundary, then that is the level to be assigned.

        var lastBoundary = boundary;

        boundary = Math.pow(level / 0.3, 2);
        if (score < boundary) {
            remaining = boundary - score;

            var levelProgress = (score-lastBoundary)/(boundary-lastBoundary) * 100;

            return [level, remaining, levelProgress];
        }
        else if (level == 9)
        {
            return [10, 0];
        }
        else continue;
    }
}