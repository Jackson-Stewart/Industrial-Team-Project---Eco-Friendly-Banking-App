const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

window.onload = refreshTransactionPage; // Refresh home page as soon as page loads.

var targetNumber = document.getElementsByClassName("accountNumber");
var targetBalance = document.getElementsByClassName("balance");
var targetAllTransactions = document.getElementById("allTransactions");
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
                                addTransactionToList(data[index], false);
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

function addTransactionToList(data, isNew) { //TODO: date and name either added to websocket data or get from lambda call
    var div = document.createElement("div");
    var anchor = document.createElement("a");
    var accountNameTo = document.createElement("p");
    var accountNumberTo = document.createElement("p");
    var date = document.createElement("p");
    var money = document.createElement("p");
    var transactionContainer = document.createElement("div");
    transactionContainer.classList.add('animate-slide-down');

    if(isNew) {
        data.transaction_id = data._id; //if data is from websocket, renames fields to match
        data.accountNumberTo = data.accountTo;
        data.recipientName = data.accountFromName;
    }
    
    if (data.name !== localStorage.getItem('name')) {
        transactionContainer.classList.add("transaction", "bg-slate-200");
        money.classList.add("ml-auto", "font-medium", "text-base", "text-green-700");
        money.innerHTML = "+£" + (Math.round((data.moneyTransferred) * 100) / 100).toFixed(2);
        anchor.setAttribute('href', "individualTransaction.html?accountNumber=" + data.accountNumberTo + "&id=" + data.transaction_id.$oid);
    } else {
        setBackgroundColour(data.calculatedGreenScore, transactionContainer); 
        money.classList.add("ml-auto", "font-medium", "text-base", "text-red-700");
        money.innerHTML = "-£" + (Math.round((data.moneyTransferred) * 100) / 100).toFixed(2);
        anchor.setAttribute('href', "individualTransaction.html" + getExtension + "&id=" + data.transaction_id.$oid);
    }

    accountNameTo.classList.add("font-medium");
    accountNumberTo.classList.add("text-xs");
    date.classList.add("text-xs");

    accountNameTo.innerHTML = data.recipientName;
    accountNumberTo.innerHTML = "Account No: " + data.accountNumberTo;
    append(div, accountNameTo);
    append(div, accountNumberTo);
    append(div, date);
    let today = new Date().toISOString().slice(0, 10);
    if (!isNew) { date.innerHTML = (data.timestamp.$date.substring(0, 10)); }
    else { date.innerHTML = today; }
    console.log(data);
    // If transaction was made today, append also to today's lists
    if (date.innerHTML === today)
        {
            var span = document.createElement("div");
            span.innerHTML = '<span class="mt-1 bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:dark:text-blue-800 border border-blue-400"><svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/></svg>Made Today</span>';
            append(div, span);
        } 
    append(transactionContainer, div);
    append(transactionContainer, money);
    append(anchor, transactionContainer);
    if(isNew) {
        targetAllTransactions.prepend(anchor);
    }
    else {
        append(anchor, transactionContainer);
        append(targetAllTransactions, anchor);
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
        showMainPage();

        /* WEBSOCKETS */

        // When page is fully loaded, initiate websocket
        const socket = new WebSocket('wss://x3em5ryqid.execute-api.eu-west-1.amazonaws.com/production/');

        socket.onopen = function () {
            console.log('Listening for new transactions...');
        };

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            console.log('New transaction received:', data[0]);
            if(data[0].accountTo === localStorage["accountNumber"]) { //check transaction is being sent to this user
                var currentBalance = parseFloat(targetBalance[0].innerText.substring(1));
                console.log(currentBalance);
                console.log(data[0].moneyTransferred);
                targetBalance[0].innerText = "£" + (currentBalance + data[0].moneyTransferred).toFixed(2);
                addTransactionToList(data[0], true); //TODO finish this
            }
        };

        socket.onclose = function () {
            console.log('WebSocket disconnected.');
        };

        /* WEBSOCKETS END */
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