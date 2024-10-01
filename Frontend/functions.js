const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

window.onload = refreshHomePage; // Refresh home page as soon as page loads.

var targetName = document.getElementsByClassName("accountName");
var targetNumber = document.getElementsByClassName("accountNumber");
var targetBalance = document.getElementsByClassName("balance");
var targetPointsRemaining = document.getElementsByClassName("pointsRemainingToNextLevel");
var targetLevels = document.getElementsByClassName("currentLevel");
var targetTransactions = document.getElementById("latestTransactions");
var targetLevelBar = document.getElementsByClassName('levelBar');
var extension = "";
if (localStorage.getItem("accountNumber") != "undefined") {
    extension = "?accountNumber=" + localStorage.getItem("accountNumber");
} else {
    extension = "?name=" + localStorage.getItem("name");
}

function append(parent, el) {
    return parent.appendChild(el);
}

async function parseJSONObject(type) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    switch (type) {
        case "Account":
            return new Promise((resolve, reject) => {
                const apiUrl = url + "/api" + extension;
                fetch(apiUrl, {
                    cache: 'no-cache',
                    method: 'GET',
                })
                    .then((response) => response.json())
                    .then((data) => {
                        userObject = data[0];
                        localStorage.setItem("accountNumber", userObject.accountNumber);
                        localStorage.setItem("name", userObject.name);
                        resolve(userObject);
                    })
            })
            break;
        case "Transaction":
            return new Promise((resolve, reject) => {
                const apiUrl = url + "/api/transactions" + extension;
                console.log(apiUrl);
                fetch(apiUrl, {
                    cache: 'no-cache',
                    method: 'GET',
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data[0] === undefined)
                        {
                            resolve(data);
                            return;
                        }

                        // Only create transaction items if valid transactions exist
                        if (Object.getOwnPropertyNames(data[0]).includes('timestamp'))
                        {
                            sortTransactionsByDate(data);
                            for (var index in data) {

                                addTransactionToList(data[index], false); //add transaction to list on homepage

                                if (index == 4)
                                {
                                    break; // Do not exceed 5 containers
                                }
                            }
                        }
                        resolve(data);
                    })
            })
            break;
        default:
            return false;
    }
}

function addTransactionToList(data, isNew) {
    var div = document.createElement("div");
    var anchor = document.createElement("a");
    var accountNameTo = document.createElement("p");
    var accountNumberTo = document.createElement("p");
    var date = document.createElement("p");
    var money = document.createElement("p");
    var transactionContainer = document.createElement("div");
    transactionContainer.classList.add('animate-slide-down');
    
    if (data.name !== localStorage.getItem('name')) {
        transactionContainer.classList.add("transaction", "bg-slate-200");
        money.classList.add("ml-auto", "font-medium", "text-base", "text-green-700");
        money.innerHTML = "+£" + (Math.round((data.moneyTransferred) * 100) / 100).toFixed(2);
        anchor.setAttribute('href', "individualTransaction.html?accountNumber=" + data.accountNumberTo + "&id=" + data.transaction_id.$oid);
    } else {
        setBackgroundColour(data.calculatedGreenScore, transactionContainer); 
        money.classList.add("ml-auto", "font-medium", "text-base", "text-red-700");
        money.innerHTML = "-£" + (Math.round((data.moneyTransferred) * 100) / 100).toFixed(2);
        anchor.setAttribute('href', "individualTransaction.html" + extension + "&id=" + data.transaction_id.$oid);
    }

    accountNameTo.classList.add("font-medium");
    accountNumberTo.classList.add("text-xs");
    date.classList.add("text-xs");

    accountNameTo.innerHTML = data.recipientName;
    accountNumberTo.innerHTML = "Account No: " + data.accountNumberTo;
    date.innerHTML = (data.timestamp.$date.substring(0, 10))
    
    append(div, accountNameTo);
    append(div, accountNumberTo);
    append(div, date);
    append(transactionContainer, div);
    append(transactionContainer, money);
    append(anchor, transactionContainer);
    if(isNew) {
        targetTransactions.prepend(anchor);
        targetTransactions.removeChild(targetTransactions.lastChild);
    }
    else {
        append(targetTransactions, anchor);
    }
}

function setBackgroundColour(rating, container) {
    if (rating == 0)
    {
        container.classList.add("transaction", "bg-slate-200");
        return;
    }
    if (rating < 0.3) // Red
    {
        container.classList.add("transaction", "bg-red-200");
    }
    else if (rating < 0.7)
    {
        container.classList.add("transaction", "bg-orange-200");
    }
    else if (rating <= 1)
    {
        container.classList.add("transaction", "bg-green-200");
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

            return [level, remaining, levelProgress]
        }
        else if (level == 9)
        {
            return [10, 0];
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
    document.getElementsByClassName("full")[0].style.visibility = 'hidden';
    document.getElementsByClassName("loader")[0].style.visibility = 'visible';
}

// Shows main content (intended after fetch completes), and hides loader
function showMainHomePage() {
    document.getElementsByClassName("full")[0].style.visibility = 'visible';
    document.getElementsByClassName("loader")[0].style.visibility = 'hidden';
}

// Refreshes the home page for current account details, and sets appropriate text.
// It's a bit slow... Should look at this again soon to understand why.
// Show loading page for 2 seconds before displaying actual page.
async function refreshHomePage() {
    hideMainHomePage();
    const object = await parseJSONObject('Account')
    const transactions = await parseJSONObject('Transaction')

    if ((object) && (transactions))
    {
        showMainHomePage()
    }

    targetName[0].innerText = object.name; // Change name within the document
    targetNumber[0].innerText = "Account number: " + object.accountNumber; // Change account number within the document
    targetBalance[0].innerText = "£" + (Math.round(object.amountOfMoney * 100) / 100).toFixed(2);; // Change balance within the document

    // Calculate current level and points remaining until next level
    let values = calculateLevel(object.currentGreenScore);
    targetLevels[0].innerText = "Level " + values[0];
    targetLevelBar[0].classList.add('w-['+values[2]+'%]')
    // Change all the level elements
    for (var i = 0; i < targetLevels.length; i++) {
        targetLevels[i].innerText = "Level " + values[0];
    }

    if (values[0] == 10) {
        document.getElementsByClassName("nextLevel")[0].innerText = "";
        document.getElementsByClassName("fullLevelText")[0].innerText = "Max Level Reached!";
    }
    else
    {
        document.getElementsByClassName("nextLevel")[0].innerText = "Level " + (values[0] + 1);
        targetPointsRemaining[0].innerText = Math.round(values[1]);
    }
}

// Order by their date. For some reason this won't work in the Lambda function correctly, but it does so here...
function sortTransactionsByDate(transactions) {
    transactions.sort((a, b) => {
        const dateA = new Date(a.timestamp.$date);
        const dateB = new Date(b.timestamp.$date);

        return dateB - dateA;
    });
}