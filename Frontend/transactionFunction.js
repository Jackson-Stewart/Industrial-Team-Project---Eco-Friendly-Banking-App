//API URL
const url = 'https://efnn495zpi.execute-api.us-east-1.amazonaws.com';

window.onload = loadingDetailsOfTransactions;

var targetCompanyItem = document.getElementById("betterCompanies");
var targetName = document.getElementsByClassName("accountName");
var targetNumber = document.getElementsByClassName("accountNumber");

// Determine the API extension based on stored account information
var getExtension = '';
if (localStorage.getItem('accountNumber') != 'undefined') {
    getExtension = '?accountNumber=' + localStorage.getItem('accountNumber');
} else {
    getExtension = '?name=' + localStorage.getItem('name');
}

function append(parent, el) {
    return parent.appendChild(el);
}

async function fetchAccountDetails() {
    const apiUrl = url + '/api' + getExtension;
    try {
        const response = await fetch(apiUrl, {
            cache: 'no-cache',
            method: 'GET',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching account details:', error);
        return null;
    }
}

// Fetching selected transaction details from API
async function fetchTransactionDetails(id) {
    const apiUrl = url + '/api/transactions' + getExtension + "&id=" + id;
    try {
        const response = await fetch(apiUrl, {
            cache: 'no-cache',
            method: 'GET',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        return null;
    }
}

async function fetchBetterCompanies(rag, spendingCategory) {
    const apiUrl = url + '/api' + "?rag=" + rag + "&spendingCategory=" + spendingCategory;
    console.log(apiUrl);
    try {
        const response = await fetch(apiUrl, {
            cache: 'no-cache',
            method: 'GET',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        return null;
    }
}

function displayTransactionDetails(transaction) {
    const detailsSection = document.querySelector('.sectionforDetails');
    if (!detailsSection) return;

    // Update details 
    detailsSection.querySelector('div:nth-child(2) p').textContent = 'Vendor Name: ' + transaction[0].recipientName;
    detailsSection.querySelector('div:nth-child(3) p').textContent = 'Spending Category: ' + (transaction[0].spendingCategory);
    detailsSection.querySelector('div:nth-child(4) p').textContent = 'Amount Sent: £' + (Math.round(transaction[0].moneyTransferred * 100) / 100).toFixed(2);
    detailsSection.querySelector('div:nth-child(5) p').textContent = 'RAG Rating: ' + transaction[0].calculatedGreenScore.toFixed(2); //displaying RAG rating fixed to 2 decimal places
    detailsSection.querySelector('div:nth-child(6) p').textContent = 'Reference: ' + transaction[0].reference;

    // Update environmental impact details
    const impactSection = document.querySelectorAll('.sectionforDetails')[1];
    if (impactSection) {
        impactSection.querySelector('div:nth-child(2) p').textContent = 'Carbon Emissions Rating: ' + transaction[0].carbonEmissionRating;
        impactSection.querySelector('div:nth-child(3) p').textContent = 'Waste Management Rating: ' + transaction[0].wasteManagementRating;
        impactSection.querySelector('div:nth-child(4) p').textContent = 'Sustainable Practices Rating: ' + transaction[0].sustainabilityPracticesRating;

        // Reference function to work out environmental impact, and display the corresponding
        //result of the company involved in the transaction
        const overallImpact = determineOverallImpact(transaction[0].calculatedGreenScore);
        impactSection.querySelector('p.mt-3').textContent = 'Overall, this company uses business practices that result in ' + overallImpact + ' to the environment';
    }
}

function displayNonCompanyDetails(transaction)
{
    const detailsSection = document.querySelector('.sectionforDetails');
    if (!detailsSection) return;

    // Update details 
    detailsSection.querySelector('div:nth-child(2) p').textContent = 'Vendor Name: ' + transaction[0].recipientName;
    detailsSection.querySelector('div:nth-child(3) p').remove();
    detailsSection.querySelector('div:nth-child(4) p').textContent = 'Amount Sent: £' + (Math.round(transaction[0].moneyTransferred * 100) / 100).toFixed(2);
    detailsSection.querySelector('div:nth-child(5) p').remove();
    detailsSection.querySelector('div:nth-child(6) p').textContent = 'Reference: ' + transaction[0].reference;

    // Update environmental impact details
    const impactSection = document.querySelectorAll('.sectionforDetails')[1];
    if (impactSection) {
        impactSection.remove();
    }

    const transactionsSection = document.querySelectorAll('.sectionforTransactions')[0];
    if (transactionsSection) {
        transactionsSection.querySelector('div:nth-child(2) h2').textContent = "Thank you for using EcoBank and its services!";
        transactionsSection.querySelector('div:nth-child(2) p').textContent = " In the meantime, check out if there are any rewards you can redeem, or make payments to green companies to gain points!";
    }
}

function determineOverallImpact(greenScore) {
    if (greenScore >= 0.7) return 'no harm';
    if (greenScore >= 0.3) return 'harm';
    return 'extreme harm';
}

//Load details of the transaction
async function loadingDetailsOfTransactions() {
    // Get transaction ID from URL parameter
    hidePage();
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');

    if (transactionId) {
        try {
            const transactionDetails = await fetchTransactionDetails(transactionId);
            const accountDetails = await fetchAccountDetails();
            targetNumber[0].innerText = "Account number: " + accountDetails[0].accountNumber;
            targetName[0].innerText = accountDetails[0].name;

            if (transactionDetails) {
                displayTransactionDetails(transactionDetails);
                const accountDetails = await fetchAccountDetails();
                if (transactionDetails[0].calculatedGreenScore.toFixed(2) == 0.00) {
                    console.log("Not a company, skipping fetching the better companies...");

                    displayNonCompanyDetails(transactionDetails);
                }
                else {
                    const data = await fetchBetterCompanies((transactionDetails[0].calculatedGreenScore.toFixed(2)), transactionDetails[0].spendingCategory)

                    for (var index in data) {
                        // Do not display red companies
                        if (data[index].rag < 0.3) {
                            continue;
                        }
                        var div = document.createElement("div");
                        var accountName = document.createElement("p");
                        var accountNumber = document.createElement("p");
                        var companyContainer = document.createElement("div");

                        if (data[index].rag < 0.3) // Red
                        {
                            companyContainer.classList.add("transaction", "bg-red-200");
                        }
                        else if (data[index].rag < 0.7) {
                            companyContainer.classList.add("transaction", "bg-orange-200");
                        }
                        else if (data[index].rag <= 1) {
                            companyContainer.classList.add("transaction", "bg-green-200");
                        }

                        accountName.classList.add("font-medium");
                        accountNumber.classList.add("text-xs");

                        accountName.innerHTML = data[index].name;
                        accountNumber.innerHTML = "Account No: " + data[index].accountNumber;

                        append(div, accountName);
                        append(div, accountNumber);
                        append(companyContainer, div);
                        append(targetCompanyItem, companyContainer);

                        if (index === 5) {
                            break; // Do not exceed 7 containers
                        }
                    }
                }

                showPage();
            }
        } catch (error) {
            console.error('Error loading transaction details:', error);
        }
    }
}

// Functionality for button back to transactions
document.addEventListener('DOMContentLoaded', function () {
    const backButton = document.getElementById('backToTransactionBtn');
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = 'transactionPage.html';
        });
    }
});

// Hides main content while API fetch completes, instead showing a loader
function hidePage() {
    document.getElementsByClassName("full")[0].style.visibility = 'hidden';
    document.getElementsByClassName("loader")[0].style.visibility = 'visible';
}

// Shows main content (intended after fetch completes), and hides loader
function showPage() {
    document.getElementsByClassName("full")[0].style.visibility = 'visible';
    document.getElementsByClassName("loader")[0].style.visibility = 'hidden';
}