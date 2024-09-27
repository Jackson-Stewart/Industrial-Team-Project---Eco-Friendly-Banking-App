const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

window.onload = refreshTransactionPage; // Refresh home page as soon as page loads.

var targetNumber = document.getElementsByClassName("accountNumber");
var targetBalance = document.getElementsByClassName("balance");
var targetAllTransactions = document.getElementById("allTransactions");
var targetTodaysTransactions = document.getElementById("todaysTransactions");
var getExtension = "";
if (localStorage.getItem("accountNumber") != "undefined") {
    getExtension = "?accountNumber=" + localStorage.getItem("accountNumber");
} else {
    getExtension = "?name=" + localStorage.getItem("name");
}

document.addEventListener('DOMContentLoaded', function() {
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    backToHomeBtn.addEventListener('click', function() {
        window.location.href = 'home.html';
    });
});

function append(parent, el) {
    return parent.appendChild(el);
}

async function parseJSONObject(type) {
    // Call API, get requested content and change into JSON object
    let userObject = '';
    switch (type) {
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
        case "Transaction":
            return new Promise((resolve, reject) => {
                const apiUrl = url + "/api/transactions" + getExtension;
                fetch(apiUrl, {
                    cache: 'no-cache',
                    method: 'GET',
                })
                    .then((response) => response.json())
                    .then((data) => {
                        let today = new Date().toISOString().slice(0, 10);
                        for (var index in data) {
                            var div = document.createElement("div");
                            var accountNameTo = document.createElement("p");
                            var accountNumberTo = document.createElement("p");
                            var date = document.createElement("p");
                            var money = document.createElement("p");
                            var transactionContainer = document.createElement("div");
                            
                            if (data[index].calculatedGreenScore < 0.3) // Red
                            {
                                transactionContainer.classList.add("transaction", "bg-red-200");
                            }
                            else if (data[index].calculatedGreenScore < 0.7)
                            {
                                transactionContainer.classList.add("transaction", "bg-orange-200");
                            }
                            else if (data[index].calculatedGreenScore <= 1)
                            {
                                transactionContainer.classList.add("transaction", "bg-green-200");
                            }

                            accountNameTo.classList.add("font-medium");
                            accountNumberTo.classList.add("text-xs");
                            date.classList.add("text-xs");
                            money.classList.add("ml-auto", "font-medium", "text-base")

                            console.log(data[index].calculatedGreenScore);
                            accountNameTo.innerHTML = data[index].recipientName;
                            accountNumberTo.innerHTML = "Account No: " + data[index].accountNumberTo;
                            date.innerHTML = (data[index].timestamp.$date.substring(0, 10));
                            money.innerHTML = "-£" + (Math.round((data[index].moneyTransferred) * 100) / 100).toFixed(2);

                            append(div, accountNameTo);
                            append(div, accountNumberTo);
                            append(div, date);
                            append(transactionContainer, div);
                            append(transactionContainer, money);
                            append(targetAllTransactions, transactionContainer);

                            // If transaction was made today, append also to today's lists
                            if (date.innerHTML === today)
                            {
                                let copy = document.createElement("div");
                                copy.classList.add("transaction", "bg-green-200");
                                copy.innerHTML = transactionContainer.innerHTML;
                                append(targetTodaysTransactions, copy);
                            }   

                            if (index === 7)
                            {
                                break; // Do not exceed 7 containers
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

// calculateCompanyGreenLevel: calculates the numeric RAG rating to 2 decimals
// Ensure total is the sum of the carbon emission, sustainability and waste practices score
function calculateCompanyGreenLevel(score) {
    divided = score / 30;
    return Math.round((divided + Number.EPSILON) * 100) / 100; // Rounds to 2 decimals
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

async function refreshTransactionPage() {
    hideMainPage();
    setTimeout(() => { showMainPage() }, 3500);
    const object = await parseJSONObject('Account')
    const transactionObject = await parseJSONObject('Transaction');

    targetNumber[0].innerText = "Account number: " + object.accountNumber; // Change account number within the document
    targetBalance[0].innerText = "£" + (Math.round(object.amountOfMoney * 100) / 100).toFixed(2); // Change balance within the document
}