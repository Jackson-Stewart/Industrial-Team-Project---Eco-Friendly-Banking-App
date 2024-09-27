const url = "https://efnn495zpi.execute-api.us-east-1.amazonaws.com";

window.onload = refreshHomePage; 

const userInfo = await fetchApiFunction();

var userName = document.getElementById("userName");
var userAccount = document.getElementById("userAccount");
var userBalance = document.getElementById("userBalance");

//Code from https://medium.com/@tejasshahade5/how-to-fetch-data-from-an-api-using-fetch-function-2147c7330a71#:~:text=The%20fetch()%20function%20sends,as%20its%20status%20and%20headers.
try {
    const userInfo = await fetchApiFunction();

    if(!response.ok) {
        throw new Error('Network response was not ok: ${response.status}');
    }

    const data = await response.json();

}

catch (error) {
    console.error("Fetch error: ", error);
}

console.log("trying this");
console.log(data[0].name);

userName.textContent = data[0].name;
userAccount.textContent = "Account Number: " + data[0].accountNumber;
userBalance.textContent = data[0].amountOfMoney;
