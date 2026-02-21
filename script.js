let destination = null;
let currentLocation;
let intervalId;

async function getCoordinates() {

    const place = document.getElementById("placeName").value;

    if (!place) {
        alert("Please enter a place name!");
        return;
    }

    document.getElementById("status").innerText = "Searching location...";

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );

    const data = await response.json();

    if (data.length === 0) {
        alert("Location not found!");
        return;
    }

    destination = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };

    document.getElementById("status").innerText =
        `Location Found! (${destination.lat}, ${destination.lng})`;
}

function startSimulation() {

    const radius = parseFloat(document.getElementById("radius").value);

    if (!destination || isNaN(radius)) {
        alert("Find location and enter radius!");
        return;
    }

    currentLocation = {
        lat: destination.lat - 0.05,
        lng: destination.lng - 0.05
    };

    document.getElementById("status").innerText = "Simulation started...";

    intervalId = setInterval(() => {

        currentLocation.lat += 0.001;
        currentLocation.lng += 0.001;

        const distance = getDistance(
            currentLocation.lat,
            currentLocation.lng,
            destination.lat,
            destination.lng
        );

        document.getElementById("status").innerText =
            "Distance: " + distance.toFixed(2) + " meters";

        if (distance <= radius) {
            triggerAlarm();
            clearInterval(intervalId);
        }

    }, 1000);
}

function stopSimulation() {
    clearInterval(intervalId);
    stopAlarm();
    document.getElementById("status").innerText = "Stopped.";
}



function triggerAlarm() 
{

    document.getElementById("status").innerText = "Destination Reached!";

    const alarm = document.getElementById("alarmSound");

    alarm.loop = true;

    alarm.play().then(() => {
        console.log("Alarm playing");
    }).catch(error => {
        console.log("Autoplay blocked:", error);
        alert("Destination Reached!");
    });

    // Save trip to backend
    fetch("http://localhost:5000/save-trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        placeName: document.getElementById("destination").value,
        timeReached: new Date().toLocaleString()
    })
});
}


function stopAlarm() {
    const alarm = document.getElementById("alarmSound");
    alarm.pause();
    alarm.currentTime = 0;
}

function getTrips() {
    fetch("http://localhost:5000/get-trips")
        .then(res => res.json())
        .then(data => alert(JSON.stringify(data, null, 2)));
}

function clearTrips() {
    fetch("http://localhost:5000/clear-trips", {
        method: "DELETE"
    }).then(() => alert("History cleared!"));
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}
