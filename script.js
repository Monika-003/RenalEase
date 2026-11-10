
const $ = id => document.getElementById(id);

const pages = [
  'dashboard', 'monitoring', 'profile', 'appointments',
  'consultation', 'sessions', 'alerts', 'reports',
  'devices', 'messages', 'prototype', 'about'
];

const pageTitles = {
  dashboard: 'Dashboard',
  monitoring: 'Live Monitoring',
  profile: 'My Profile',
  appointments: 'Doctor Appointments',
  consultation: 'Video Consultation',
  sessions: 'Dialysis Sessions',
  alerts: 'Alerts & Notifications',
  reports: 'Medical Reports',
  devices: 'Device Management',
  messages: 'Messages',
  prototype: 'Our Prototype',
  about: 'About RenalEase'
};

// Load saved demo information
let appointments = JSON.parse(localStorage.getItem('reAppointments') || '[]');
let sessions = JSON.parse(localStorage.getItem('reSessions') || '[]');
let devices = JSON.parse(localStorage.getItem('reDevices') || '[]');
let alerts = JSON.parse(localStorage.getItem('reAlerts') || '[]');
let messages = JSON.parse(localStorage.getItem('reMessages') || '[]');

let monitorTimer = null;
let activeSession = false;
let sessionStart = null;
let toastTimer;

// Save browser data
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Safe display of user-entered text
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Notification message
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 2600);
}

// PAGE NAVIGATION
function go(page) {
  if (!pages.includes(page)) return;

  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === `page-${page}`);
  });

  document.querySelectorAll('.nav-link').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  $('pageTitle').textContent = pageTitles[page];
  $('sidebar').classList.remove('open');

  if (page === 'reports') renderReports();
  if (page === 'consultation') renderMeeting();
  if (page === 'dashboard') {
    drawChart('dashChart', $('dashSensor').value);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => go(button.dataset.page));
});

document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => go(button.dataset.go));
});

$('menuBtn').addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
});

// CHART FUNCTION
function drawChart(canvasId, sensor) {
  const canvas = $(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const width = Math.max(300, rect.width);
  const height = canvas.clientHeight || 220;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const data = {
    heart: [70,74,72,78,76,73,79,76,75,77,74,76],
    temp: [36.5,36.6,36.7,36.6,36.8,36.7,36.9,36.8,36.7,36.8,36.9,36.8],
    pressure: [78,80,79,82,81,80,83,82,81,80,82,80]
  }[sensor] || [];

  const padding = 34;
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;

  ctx.clearRect(0, 0, width, height);

  // Horizontal grid
  ctx.strokeStyle = '#edf1f5';
  ctx.lineWidth = 1;

  for (let i = 0; i < 4; i++) {
    const y = padding + i * (height - padding * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
  }

  // Draw line
  ctx.strokeStyle = '#2785c2';
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  data.forEach((value, index) => {
    const x = padding + index * (width - padding - 12) / (data.length - 1);
    const y = height - padding -
      (value - min) / (max - min) * (height - padding * 2);

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // Draw points
  data.forEach((value, index) => {
    const x = padding + index * (width - padding - 12) / (data.length - 1);
    const y = height - padding -
      (value - min) / (max - min) * (height - padding * 2);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#2785c2';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Time labels
  ctx.fillStyle = '#8a99aa';
  ctx.font = '10px sans-serif';

  ['-55m', '-45m', '-35m', '-25m', '-15m', 'Now'].forEach((label, i) => {
    ctx.fillText(label, padding + i * (width - padding - 15) / 5, height - 7);
  });
}

// Chart dropdowns
$('dashSensor').addEventListener('change', e => {
  drawChart('dashChart', e.target.value);
});

$('liveSensor').addEventListener('change', e => {
  drawChart('liveChart', e.target.value);
});

window.addEventListener('resize', () => {
  drawChart('dashChart', $('dashSensor').value);
  drawChart('liveChart', $('liveSensor').value);
});

// SIMULATED SENSOR VALUES
function updateDemoReadings() {
  const temp = (36.6 + Math.random() * 0.5).toFixed(1);
  const heart = Math.floor(70 + Math.random() * 15);
  const sys = 118 + Math.floor(Math.random() * 7);
  const dia = 76 + Math.floor(Math.random() * 7);

  ['dashTemp', 'liveTemp'].forEach(id => {
    $(id).innerHTML = `${temp} <small>°C</small>`;
  });

  ['dashHeart', 'liveHeart'].forEach(id => {
    $(id).innerHTML = `${heart} <small>BPM</small>`;
  });

  ['dashPressure', 'livePressure'].forEach(id => {
    $(id).innerHTML = `${sys}/${dia} <small>mmHg</small>`;
  });

  $('lastUpdated').textContent =
    'Last demo update: ' + new Date().toLocaleTimeString();

  if (monitorTimer) {
    drawChart('liveChart', $('liveSensor').value);
  }
}

$('startMonitor').addEventListener('click', () => {
  if (monitorTimer) return;

  updateDemoReadings();
  monitorTimer = setInterval(updateDemoReadings, 5000);

  $('monitorStatus').textContent = 'Demo monitoring running';
  toast('Demo monitoring started');
});

$('stopMonitor').addEventListener('click', () => {
  clearInterval(monitorTimer);
  monitorTimer = null;

  $('monitorStatus').textContent = 'Demo monitoring stopped';
  toast('Demo monitoring stopped');
});

// APPOINTMENTS
function renderAppointments() {
  const body = $('appointmentTable');

  body.innerHTML = appointments.length
    ? appointments.map((a, i) => `
      <tr>
        <td>${escapeHTML(a.doctor)}</td>
        <td>${escapeHTML(a.date)}<br>${escapeHTML(a.time)}</td>
        <td>${escapeHTML(a.type)}</td>
        <td><span class="tag">${escapeHTML(a.status)}</span></td>
        <td>
          <button class="text-btn cancel-appointment" data-index="${i}">
            Cancel
          </button>
        </td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" class="empty">No appointments yet.</td></tr>';

  document.querySelectorAll('.cancel-appointment').forEach(button => {
    button.addEventListener('click', () => {
      appointments.splice(Number(button.dataset.index), 1);
      save('reAppointments', appointments);
      renderAppointments();
      renderMeeting();
      renderDashboard();
      toast('Appointment removed from demo');
    });
  });

  const upcoming = appointments
    .filter(a => a.status !== 'Cancelled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  if (upcoming) {
    const date = new Date(upcoming.date + 'T00:00:00');

    $('nextDay').textContent = date.getDate();
    $('nextMonth').textContent =
      date.toLocaleString('en', { month: 'short' });

    $('nextDoctor').textContent = upcoming.doctor;
    $('nextTime').textContent = upcoming.date + ' at ' + upcoming.time;
  } else {
    $('nextDay').textContent = '--';
    $('nextMonth').textContent = '---';
    $('nextDoctor').textContent = 'No appointment booked';
    $('nextTime').textContent = 'Book an appointment to see details';
  }
}

$('appointmentDate').min = new Date().toISOString().split('T')[0];

$('appointmentForm').addEventListener('submit', e => {
  e.preventDefault();

  const form = new FormData(e.target);
  const item = Object.fromEntries(form.entries());

  if (item.date < new Date().toISOString().split('T')[0]) {
    $('appointmentFeedback').textContent = 'Choose a future date.';
    return;
  }

  item.status = 'Requested';
  item.id = 'APT-' + Date.now();

  appointments.push(item);
  save('reAppointments', appointments);

  renderAppointments();
  renderMeeting();
  renderDashboard();

  e.target.reset();

  $('appointmentFeedback').textContent =
    'Demo appointment request saved.';

  toast('Appointment request saved');
});

// VIDEO CONSULTATION
function renderMeeting() {
  const appointment = appointments
    .filter(a => a.type === 'Video consultation')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  if (!appointment) {
    $('meetingDetails').textContent =
      'No video consultation scheduled yet.';
    return;
  }

  $('meetingDetails').innerHTML = `
    <div class="detail-row">
      <span>Doctor</span>
      <strong>${escapeHTML(appointment.doctor)}</strong>
    </div>
    <div class="detail-row">
      <span>Date</span>
      <strong>${escapeHTML(appointment.date)}</strong>
    </div>
    <div class="detail-row">
      <span>Time</span>
      <strong>${escapeHTML(appointment.time)}</strong>
    </div>
    <div class="detail-row">
      <span>Status</span>
      <strong>${escapeHTML(appointment.status)}</strong>
    </div>
    <p class="small-note">
      A real meeting link requires secure video-service integration.
    </p>
  `;
}

// SESSION MANAGEMENT
function renderSessions() {
  $('sessionTable').innerHTML = sessions.length
    ? sessions.slice().reverse().map(s => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.date)}</td>
        <td>${escapeHTML(s.duration)} min</td>
        <td>${escapeHTML(s.preWeight || '--')} / ${escapeHTML(s.postWeight || '--')}</td>
        <td><span class="tag green">${escapeHTML(s.status)}</span></td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" class="empty">No session records yet.</td></tr>';
}

$('startSession').addEventListener('click', () => {
  if (activeSession) return;

  activeSession = true;
  sessionStart = new Date();

  $('sessionState').textContent = 'Demo session in progress';
  $('sessionStarted').textContent =
    'Started at ' + sessionStart.toLocaleString();

  $('startSession').disabled = true;
  $('endSession').disabled = false;
  $('monitorSession').textContent = 'Demo in progress';

  toast('Demo session started — no hardware control');
});

$('endSession').addEventListener('click', () => {
  if (!activeSession) return;

  activeSession = false;

  $('sessionState').textContent = 'Demo session ended';
  $('sessionStarted').textContent =
    'Ended at ' + new Date().toLocaleString();

  $('startSession').disabled = false;
  $('endSession').disabled = true;
  $('monitorSession').textContent = 'Not started';

  toast('Demo session ended');
});

$('sessionDate').value = new Date().toISOString().split('T')[0];

$('sessionForm').addEventListener('submit', e => {
  e.preventDefault();

  const item = Object.fromEntries(
    new FormData(e.target).entries()
  );

  item.id = 'SES-' + String(Date.now()).slice(-7);
  item.status = 'Recorded (demo)';

  sessions.push(item);
  save('reSessions', sessions);

  renderSessions();
  renderDashboard();

  e.target.reset();
  $('sessionDate').value = new Date().toISOString().split('T')[0];

  $('sessionFeedback').textContent =
    'Session record saved in this browser.';
});

// ALERTS
function renderAlerts() {
  $('alertList').innerHTML = alerts.length
    ? alerts.slice().reverse().map(a => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(a.title)}</strong>
          <small>
            ${escapeHTML(a.time)} • ${escapeHTML(a.description)}
          </small>
        </div>
        <span class="tag">${escapeHTML(a.type)}</span>
      </div>
    `).join('')
    : '<div class="empty">No alerts. Demo system is clear.</div>';
}

$('clearAlerts').addEventListener('click', () => {
  alerts = [];
  save('reAlerts', alerts);
  renderAlerts();
  renderDashboard();
});

// DEVICE MANAGEMENT
function renderDevices() {
  $('deviceCount').textContent = devices.length + ' device(s)';

  $('deviceList').innerHTML = devices.length
    ? devices.map((d, i) => `
      <div class="device-card">
        <div>
          <strong>${escapeHTML(d.name)}</strong>
          <small>
            ${escapeHTML(d.type)} • ${escapeHTML(d.connection)}
            • ${escapeHTML(d.deviceId || 'No ID')}
            <br>Status: Not connected
          </small>
        </div>
        <button data-remove="${i}">Remove</button>
      </div>
    `).join('')
    : '<div class="empty">No devices added yet.</div>';

  document.querySelectorAll('[data-remove]').forEach(button => {
    button.addEventListener('click', () => {
      devices.splice(Number(button.dataset.remove), 1);
      save('reDevices', devices);
      renderDevices();
      renderDashboard();
    });
  });

  $('dashDevice').textContent =
    devices.length ? 'Added / Offline' : 'Offline';

  $('monitorDevice').textContent =
    devices.length ? devices[0].name + ' (offline)' : 'Not connected';
}

$('deviceForm').addEventListener('submit', e => {
  e.preventDefault();

  const device = Object.fromEntries(
    new FormData(e.target).entries()
  );

  devices.push(device);
  save('reDevices', devices);

  renderDevices();
  e.target.reset();

  $('deviceFeedback').textContent =
    'Device saved. Hardware remains offline.';

  toast('Device added in demo');
});

// DASHBOARD
function renderDashboard() {
  $('dashboardAlerts').innerHTML = alerts.length
    ? alerts.slice(-3).reverse().map(a => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(a.title)}</strong>
          <small>${escapeHTML(a.time)}</small>
        </div>
        <span class="tag">${escapeHTML(a.type)}</span>
      </div>
    `).join('')
    : '<div class="empty">No recent alerts.</div>';

  $('dashboardSessions').innerHTML = sessions.length
    ? sessions.slice(-3).reverse().map(s => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(s.id)}</strong>
          <small>${escapeHTML(s.date)} • ${escapeHTML(s.duration)} min</small>
        </div>
        <span class="tag green">Recorded</span>
      </div>
    `).join('')
    : '<div class="empty">No session records yet.</div>';
}

// REPORTS
function renderReports() {
  $('reportAppointments').textContent = appointments.length;
  $('reportSessions').textContent = sessions.length;
  $('reportAlerts').textContent = alerts.length;

  $('reportSummary').innerHTML = `
    <p><strong>Patient:</strong> ${escapeHTML($('profileName').value || 'Monika R')}</p>
    <p><strong>Patient ID:</strong> RE-001</p>
    <p><strong>Appointments:</strong> ${appointments.length}</p>
    <p><strong>Session records:</strong> ${sessions.length}</p>
    <p><strong>Registered devices:</strong> ${devices.length} (not connected)</p>
    <p><strong>Data source:</strong> Local browser demo records and simulated readings.</p>
  `;
}

$('printReport').addEventListener('click', () => {
  window.print();
});

// PATIENT PROFILE
$('profileForm').addEventListener('submit', e => {
  e.preventDefault();

  const name = $('profileName').value.trim();

  $('profileFeedback').textContent =
    'Profile saved for this page session.';

  document.querySelector('.profile-mini strong').textContent = name;

  toast('Profile details updated');
});

// MESSAGES
$('messageForm').addEventListener('submit', e => {
  e.preventDefault();

  const form = new FormData(e.target);
  const message = String(form.get('message') || '').trim();

  if (!message) return;

  messages.push({
    text: message,
    time: new Date().toLocaleTimeString()
  });

  save('reMessages', messages);
  renderMessages();
  e.target.reset();
});

function renderMessages() {
  $('chatMessages').innerHTML =
    `<div class="chat-bubble received">
      Welcome to the RenalEase demo. This is not a real clinical messaging service.
    </div>` +
    messages.map(message => `
      <div class="chat-bubble sent">
        ${escapeHTML(message.text)}
        <br><small>${escapeHTML(message.time)}</small>
      </div>
    `).join('');

  $('chatMessages').scrollTop = $('chatMessages').scrollHeight;
}

// INITIALIZE WEBSITE
function initialize() {
  renderAppointments();
  renderMeeting();
  renderSessions();
  renderAlerts();
  renderDevices();
  renderDashboard();
  renderMessages();

  drawChart('dashChart', 'heart');
  drawChart('liveChart', 'heart');

  if (!alerts.length) {
    alerts = [{
      title: 'Prototype device is offline',
      description: 'No physical device is communicating with this demo website.',
      time: new Date().toLocaleString(),
      type: 'System'
    }];

    save('reAlerts', alerts);
    renderAlerts();
    renderDashboard();
  }
}

initialize();
