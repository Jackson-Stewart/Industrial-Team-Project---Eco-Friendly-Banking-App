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
                        if (data[0] === undefined)
                            {
                                resolve(data);
                                return;
                            }
                        
                        // Only create transaction items if valid transactions exist
                        if (Object.getOwnPropertyNames(data[0]).includes('timestamp')) {
                            sortTransactionsByDate(data);
                            let today = new Date().toISOString().slice(0, 10);
                            for (var index in data) {
                                console.log(data[index]);
                                var div = document.createElement("div");
                                var anchor = document.createElement("a");
                                var accountNameTo = document.createElement("p");
                                var accountNumberTo = document.createElement("p");
                                var date = document.createElement("p");
                                var money = document.createElement("p");
                                var transactionContainer = document.createElement("div");
                                
                                setBackgroundColour(data[index].calculatedGreenScore, transactionContainer);
                                // <a href="https://www.w3schools.com">Visit W3Schools.com!</a>
                                anchor.setAttribute('href', "individualTransaction.html" + getExtension + "&id=" + data[index].transaction_id.$oid);
                                accountNameTo.classList.add("font-medium");
                                accountNumberTo.classList.add("text-xs");
                                date.classList.add("text-xs");
                                money.classList.add("ml-auto", "font-medium", "text-base")

                                accountNameTo.innerHTML = data[index].recipientName;
                                accountNumberTo.innerHTML = "Account No: " + data[index].accountNumberTo;
                                date.innerHTML = (data[index].timestamp.$date.substring(0, 10));
                                money.innerHTML = "-£" + (Math.round((data[index].moneyTransferred) * 100) / 100).toFixed(2);

                                append(div, accountNameTo);
                                append(div, accountNumberTo);
                                append(div, date);
                                append(transactionContainer, div);
                                append(transactionContainer, money);
                                append(anchor, transactionContainer);
                                append(targetAllTransactions, anchor);

                                // If transaction was made today, append also to today's lists
                                if (date.innerHTML === today)
                                {
                                    let copy = document.createElement("div");
                                    copy.innerHTML = JSON.parse(JSON.stringify(targetAllTransactions.innerHTML));
                                    append(targetTodaysTransactions, copy);
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
    const object = await parseJSONObject('Account')
    const transactionObject = await parseJSONObject('Transaction');

    if ((object) && (transactionObject))
    {
        showMainPage()
    }
    
    targetNumber[0].innerText = "Account number: " + object.accountNumber; // Change account number within the document
    targetBalance[0].innerText = "£" + (Math.round(object.amountOfMoney * 100) / 100).toFixed(2); // Change balance within the document
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

// Order by their date. For some reason this won't work in the Lambda function correctly, but it does so here...
function sortTransactionsByDate(transactions) {
    transactions.sort((a, b) => {
        const dateA = new Date(a.timestamp.$date);
        const dateB = new Date(b.timestamp.$date);

        return dateB - dateA;
    });
}