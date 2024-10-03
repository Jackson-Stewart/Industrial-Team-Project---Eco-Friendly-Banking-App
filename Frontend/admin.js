var description = document.getElementById("description");
var discountAmount = document.getElementById("discountAmount");
var costOfPoints = document.getElementById("costOfPoints");
var submit = document.getElementById("submit");

submit.addEventListener('click', function () {
    localStorage.setItem("description", description.value);
	localStorage.setItem("discountAmount", discountAmount.value);
	localStorage.setItem("costOfPoints", costOfPoints.value);
	window.location.href = "login.html";
});
