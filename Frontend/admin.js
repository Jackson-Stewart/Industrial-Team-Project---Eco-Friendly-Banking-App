var description = document.getElementById("description");
var discountAmount = document.getElementById("discountAmount");
var costOfPoints = document.getElementById("costOfPoints");
var submit = document.getElementById("submit");

localStorage.setItem("newReward", "false");

submit.addEventListener('click', function () {
    localStorage.setItem("description", description.value);
	localStorage.setItem("discountAmount", discountAmount.value);
	localStorage.setItem("costOfPoints", costOfPoints.value);

	//If the fields have been filled
	if (description.value.length != 0 && discountAmount.value.length != 0 && costOfPoints.value.length != 0)
	{
		localStorage.setItem("newReward", "true");
	}
	
	window.location.href = "login.html";
});
