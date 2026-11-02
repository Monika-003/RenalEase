
// =====================================
// PAGE NAVIGATION
// =====================================

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");

const pageDetails = {
    dashboard: [
        "Dashboard",
        "Welcome to RenalEase monitoring system."
    ],
    monitoring: [
        "Live Monitoring",
        "View sensor readings and monitoring information."
    ],
    alerts: [
        "Alerts",
        "System notifications and device information."
    ],
    history: [
        "Session History",
        "View sample monitoring records."
    ],
    device: [
        "Device Status",
        "Manage your RenalEase devices."
    ],
    prototype: [
        "Our Prototype",
        "Explore the RenalEase hardware innovation."
    ],
    about: [
        "About Project",
        "Learn more about the RenalEase project."
    ]
};

navLinks.forEach(function(link) {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const selectedPage = link.dataset.page;

        pages.forEach(function(page) {
            page.classList.add("hidden");
        });

        navLinks.forEach(function(item) {
            item.classList.remove("active");
        });

        document.getElementById(selectedPage)
            .classList.remove("hidden");

        link.classList.add("active");

        document.getElementById("page-title").textContent =
            pageDetails[selectedPage][0];

        document.getElementById("page-description").textContent =
            pageDetails[selectedPage][1];

        if (selectedPage === "dashboard") {
            drawChart("monitorChart", sensorSelect.value);
        }

        if (selectedPage === "monitoring") {
            drawChart("liveChart", "temperature");
        }

    });

});


// =====================================
// DEMO SENSOR READINGS
// =====================================

let temperature = 36.8;
let pressure = 82;
let heartRate = 76;

function updateReadings() {

    // Simulated values for frontend testing only
    temperature = Number(
        (36.5 + Math.random() * 0.6).toFixed(1)
    );

    pressure = Math.floor(78 + Math.random() * 10);

    heartRate = Math.floor(72 + Math.random() * 12);

    document.getElementById("temperature").textContent =
        temperature + " °C";

    document.getElementById("pressure").textContent =
        pressure + " mmHg";

    document.getElementById("heartRate").textContent =
        heartRate + " BPM";

    document.getElementById("liveTemperature").textContent =
        temperature + " °C";

    document.getElementById("livePressure").textContent =
        pressure + " mmHg";

    document.getElementById("liveHeartRate").textContent =
        heartRate + " BPM";
}


// =====================================
// GRAPH DATA
// =====================================

const chartData = {
    temperature: [36.5, 36.7, 36.6, 36.9, 36.8, 37.0, 36.8],
    pressure: [78, 80, 79, 83, 81, 85, 82],
    heartRate: [72, 75, 74, 78, 76, 80, 76]
};

const chartLabels = [
    "10:00",
    "10:05",
    "10:10",
    "10:15",
    "10:20",
    "10:25",
    "10:30"
];


// =====================================
// SIMPLE CANVAS GRAPH
// =====================================

function drawChart(canvasId, sensor) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = 230;

    if (width === 0) return;

    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const data = chartData[sensor];

    const left = 45;
    const right = width - 15;
    const top = 15;
    const bottom = height - 35;

    const graphWidth = right - left;
    const graphHeight = bottom - top;

    const minValue = Math.min(...data) - 1;
    const maxValue = Math.max(...data) + 1;

    ctx.clearRect(0, 0, width, height);

    // Horizontal grid lines
    ctx.strokeStyle = "#edf1f4";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y = top + (graphHeight / 4) * i;

        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        const value = maxValue -
            ((maxValue - minValue) / 4) * i;

        ctx.fillStyle = "#8995a3";
        ctx.font = "11px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            value.toFixed(sensor === "temperature" ? 1 : 0),
            left - 9,
            y + 4
        );
    }

    // Draw line
    ctx.beginPath();

    data.forEach(function(value, index) {

        const x = left +
            (graphWidth / (data.length - 1)) * index;

        const y = bottom -
            ((value - minValue) / (maxValue - minValue)) *
            graphHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    });

    ctx.strokeStyle = "#087f8c";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw data points
    data.forEach(function(value, index) {

        const x = left +
            (graphWidth / (data.length - 1)) * index;

        const y = bottom -
            ((value - minValue) / (maxValue - minValue)) *
            graphHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);

        ctx.fillStyle = "#087f8c";
        ctx.fill();

    });

    // X-axis labels
    ctx.fillStyle = "#8995a3";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";

    chartLabels.forEach(function(label, index) {

        const x = left +
            (graphWidth / (chartLabels.length - 1)) * index;

        ctx.fillText(label, x, height - 12);

    });

}


// =====================================
// SENSOR SELECTION
// =====================================

const sensorSelect = document.getElementById("sensorSelect");
const chartTitle = document.getElementById("chartTitle");

const sensorNames = {
    temperature: "Temperature Monitoring",
    pressure: "Pressure Monitoring",
    heartRate: "Heart Rate Monitoring"
};

sensorSelect.addEventListener("change", function() {

    const selectedSensor = sensorSelect.value;

    chartTitle.textContent = sensorNames[selectedSensor];

    drawChart("monitorChart", selectedSensor);

});


// =====================================
// DEVICE MANAGEMENT
// =====================================

const openDeviceForm = document.getElementById("openDeviceForm");
const deviceForm = document.getElementById("deviceForm");

const cancelDevice = document.getElementById("cancelDevice");
const connectDevice = document.getElementById("connectDevice");

const deviceName = document.getElementById("deviceName");
const deviceType = document.getElementById("deviceType");
const connectionType = document.getElementById("connectionType");

const deviceList = document.getElementById("deviceList");
const deviceCount = document.getElementById("deviceCount");
const deviceMessage = document.getElementById("deviceMessage");

const sidebarHardwareStatus =
    document.getElementById("sidebarHardwareStatus");

let devices = [];


// Open form
openDeviceForm.addEventListener("click", function() {

    deviceForm.classList.remove("hidden");

    deviceMessage.textContent = "";

    deviceName.focus();

});


// Cancel form
cancelDevice.addEventListener("click", function() {

    deviceForm.classList.add("hidden");

    deviceName.value = "";

    deviceMessage.textContent = "";

});


// Add device
connectDevice.addEventListener("click", function() {

    const name = deviceName.value.trim();
    const type = deviceType.value;
    const connection = connectionType.value;

    if (name === "") {

        deviceMessage.textContent =
            "Please enter a device name.";

        deviceName.focus();

        return;
    }

    const newDevice = {
        id: Date.now(),
        name: name,
        type: type,
        connection: connection,
        status: "Not Connected"
    };

    devices.push(newDevice);

    displayDevices();

    deviceName.value = "";

    deviceForm.classList.add("hidden");

    deviceMessage.textContent = "";

});


// Display devices
function displayDevices() {

    deviceList.innerHTML = "";

    deviceCount.textContent =
        devices.length +
        (devices.length === 1 ? " Device" : " Devices");

    if (devices.length === 0) {

        deviceList.innerHTML = `
            <div class="empty-device">
                <div class="empty-icon">▣</div>
                <h3>No Devices Added</h3>
                <p>
                    Add your Arduino or compatible device to get started.
                </p>
            </div>
        `;

        sidebarHardwareStatus.textContent = "Not Connected";

        return;
    }

    devices.forEach(function(device) {

        const deviceCard = document.createElement("div");
        deviceCard.className = "device-item";

        const left = document.createElement("div");
        left.className = "device-item-left";

        const icon = document.createElement("div");
        icon.className = "device-item-icon";
        icon.textContent = "▣";

        const details = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = device.name;

        const description = document.createElement("p");
        description.textContent =
            device.type + " | " + device.connection;

        const status = document.createElement("span");
        status.className = "device-pending";
        status.textContent = device.status;

        details.appendChild(title);
        details.appendChild(description);
        details.appendChild(status);

        left.appendChild(icon);
        left.appendChild(details);

        const removeButton = document.createElement("button");
        removeButton.className = "remove-device-btn";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function() {

            devices = devices.filter(function(item) {
                return item.id !== device.id;
            });

            displayDevices();

        });

        deviceCard.appendChild(left);
        deviceCard.appendChild(removeButton);

        deviceList.appendChild(deviceCard);

    });

    sidebarHardwareStatus.textContent = "Device Added - Offline";

}


// =====================================
// INITIAL DISPLAY
// =====================================

updateReadings();

displayDevices();


// Update demo readings every 5 seconds
setInterval(function() {
    updateReadings();
}, 5000);


// Redraw graphs when window size changes
window.addEventListener("resize", function() {

    const dashboardVisible =
        !document.getElementById("dashboard")
            .classList.contains("hidden");

    const monitoringVisible =
        !document.getElementById("monitoring")
            .classList.contains("hidden");

    if (dashboardVisible) {
        drawChart("monitorChart", sensorSelect.value);
    }

    if (monitoringVisible) {
        drawChart("liveChart", "temperature");
    }

});
