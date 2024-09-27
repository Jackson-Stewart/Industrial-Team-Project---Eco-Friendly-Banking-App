const url = 'https://efnn495zpi.execute-api.us-east-1.amazonaws.com';

window.onload = refreshRewardsPage;

var targetAllRewards = document.getElementById("allRewards");
var targetNumber = document.getElementsByClassName('accountNumber');
var targetGreenScore = document.getElementsByClassName('greenScore');
var targetLevel = document.getElementsByClassName('currentLevel');
var targetPointsRemaining = document.getElementsByClassName("pointsRemainingToNextLevel");
var targetLeaderboard = document.getElementById('leaderboardData');
var targetLevelBar = document.getElementsByClassName('levelBar');

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

                const apiUrl2 = url + "/api/accounts";
                fetch(apiUrl2, {
                    cache: 'no-cache',
                    method: 'GET',
                })
                .then((response) => response.json())
                .then((data) => {
                    allUsers = data.filter(company => !('carbonEmissionRating' in company)).sort((a, b) => b.currentGreenScore - a.currentGreenScore);
                    for (var index in allUsers){
                        var div = document.createElement('div');
                        var circle = document.createElement('div');
                        var name = document.createElement('h4');
                        var points = document.createElement('p');

                        div.classList.add('leaderboard-name');
                        circle.classList.add('circle');
                        name.classList.add('font-medium', 'text-sm');
                        points.classList.add('text-sm', 'ml-auto', 'mr-2');

                        circle.innerHTML = Number(index) + 1;
                        name.innerHTML = allUsers[index].name;
                        points.innerHTML = allUsers[index].currentGreenScore;
                        
                        if (index == 0){
                            circle.classList.add('bg-[#FFD700]');
                        } else if (index == 1){
                            circle.classList.add('bg-[#C0C0C0]');
                        } else if (index == 2){
                            circle.classList.add('bg-[#CE8946]');
                        } else {
                            circle.classList.add('bg-primary');
                        }

                        append(div, circle);
                        append(div, name);
                        append(div, points);
                        append(targetLeaderboard, div);
                    }
                    resolve(allUsers);
                })
                    
            })

            break;
        case "Reward":
            return new Promise((resolve, reject) => {
                const apiUrl = url + "/api/rewards";
                fetch(apiUrl, {
                    cache: 'no-cache',
                    method: 'GET',
                })
                .then((response) => response.json())
                .then((data) => {
                    for (var index in data){
                        var div = document.createElement('div');
                        var nameDiv = document.createElement('div');
                        var rewardName = document.createElement('h4');
                        var points = document.createElement('p');
                        var pointsNumber = document.createElement('span');
                        var pointsText = document.createElement('span');

                        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svg.setAttribute("class", "absolute top-1 right-4 text-gray-400 h-7 w-7");
                        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        svg.setAttribute("height", "24px");
                        svg.setAttribute("viewBox", "0 -960 960 960");
                        svg.setAttribute("width", "24px");
                        svg.setAttribute("fill", "currentColor");
                        
                        // Create the path element inside the SVG
                        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path.setAttribute("d", "M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z");
                        
                        // Append the path to the SVG
                        svg.appendChild(path);


                        var svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svg2.setAttribute("class", "text-primary mr-1.5");
                        svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        svg2.setAttribute("height", "24px");
                        svg2.setAttribute("viewBox", "0 -960 960 960");
                        svg2.setAttribute("width", "24px");
                        svg2.setAttribute("fill", "currentColor");
                        
                        // Create the path element inside the SVG
                        var path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path2.setAttribute("d", "m668-380 152-130 120 10-176 153 52 227-102-62-46-198Zm-94-292-42-98 46-110 92 217-96-9ZM294-287l126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM173-120l65-281L20-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-340Z");
                        
                        // Append the path to the SVG
                        svg2.appendChild(path2);
        
                        div.classList.add('bg-white', 'flex', 'relative', 'shadow-md', 'border', 'border-gray-300', 'relative', 'py-4', 'px-4', 'mt-2');
                        nameDiv.classList.add('flex', 'items-center');
                        rewardName.classList.add('text-primary');
                        points.classList.add('absolute', 'text-primary', 'right-4', 'bottom-2', 'text-xs');
                        
                        pointsNumber.innerHTML = data[index].points;
                        pointsNumber.style.fontWeight = "bold";
                        pointsText.innerHTML = " points";
        
                        rewardName.innerHTML = data[index].name;
                        append(div, svg);
                        append(nameDiv, svg2);
                        append(div, nameDiv);
                        append(nameDiv, rewardName);
                        append(points, pointsNumber);
                        append(points, pointsText);
                        append(div, points);
                        append(targetAllRewards, div);

                        div.onclick = (function(name, pointsValue) {
                            return function() {
                                showDialog(name, pointsValue);
                            };
                        })(rewardName.innerHTML, pointsNumber.innerHTML);
                    }
        
                    resolve(data);
                })
            })
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
    setTimeout(() => { showMainPage() }, 3500);
    const object = await parseJSONObject('Reward');
    const accountObject = await parseJSONObject('Account');

    targetNumber[0].innerText = "Account number: " + accountObject.accountNumber; // Change account number within the document
    targetGreenScore[0].innerText = accountObject.currentGreenScore;
    let values = calculateLevel(accountObject.currentGreenScore);
    console.log(values);
    targetLevel[0].innerText = "Level " + values[0];
    targetLevelBar[0].classList.add('w-['+values[2]+'%]')

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