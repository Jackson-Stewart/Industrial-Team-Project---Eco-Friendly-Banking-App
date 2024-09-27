//API URL
const url = 'https://efnn495zpi.execute-api.us-east-1.amazonaws.com';

window.onload = loadingDetailsOfTransactions;

var targetCompanyItem = document.getElementById("betterCompanies");

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

    console.log(transaction[0]);
    // Update details 
    detailsSection.querySelector('div:nth-child(2) p').textContent = 'Vendor Name: ' + transaction[0].recipientName;
    detailsSection.querySelector('div:nth-child(3) p').textContent = 'Spending Category: ' + (transaction[0].spendingCategory);
    detailsSection.querySelector('div:nth-child(4) p').textContent = 'Amount Sent: £' + (Math.round(transaction[0].moneyTransferred * 100) / 100).toFixed(2);
    detailsSection.querySelector('div:nth-child(5) p').textContent = 'RAG Rating: ' + transaction[0].calculatedGreenScore.toFixed(2); //displaying RAG rating fixed to 2 decimal places

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

function determineOverallImpact(greenScore) {
    if (greenScore >= 0.7) return 'no harm';
    if (greenScore >= 0.4) return 'harm';
    return 'extreme harm';
}

//Load details of the transaction
async function loadingDetailsOfTransactions() {
    // Get transaction ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');

    if (transactionId) {
        try {
            const transactionDetails = await fetchTransactionDetails(transactionId);
            if (transactionDetails) {
                displayTransactionDetails(transactionDetails);
                const data = await fetchBetterCompanies((transactionDetails[0].calculatedGreenScore.toFixed(2)), transactionDetails[0].spendingCategory)
                console.log(data[0]);

                for (var index in data) {
                    var div = document.createElement("div");
                    var accountName = document.createElement("p");
                    var accountNumber = document.createElement("p");
                    var companyContainer = document.createElement("div");
                    
                    if (data[index].rag < 0.3) // Red
                    {
                        companyContainer.classList.add("transaction", "bg-red-200");
                    }
                    else if (data[index].rag < 0.7)
                    {
                        companyContainer.classList.add("transaction", "bg-orange-200");
                    }
                    else if (data[index].rag <= 1)
                    {
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

                    if (index === 5)
                    {
                        break; // Do not exceed 7 containers
                    }
                }
            }
        } catch (error) {
            console.error('Error loading transaction details:', error);
        }
    }
}

// Functionality for button back to transactions
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backToTransactionBtn');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'transactionPage.html';
        });
    }
});