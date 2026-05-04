/* ============================================================
   AI DISASTER RESPONSE SYSTEM — CORE SCRIPT v2.1
   Auth, SOS, Credits, Admin, Toasts, Theming, Predictions
   ============================================================ */

// ════════════════════════════════════════════════════════════
// EMAILJS CONFIG  — fill in your credentials from emailjs.com
// ════════════════════════════════════════════════════════════
const EMAILJS_PUBLIC_KEY  = 'ttBRwcS03DGGfpLXQ';
const EMAILJS_SERVICE_ID  = 'service_0xai6dy';
const EMAILJS_TEMPLATE_ID = 'template_jiheis5';

// Initialize EmailJS (required for v4+)
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// ════════════════════════════════════════════════════════════
// SAFE LOCALSTORAGE WRAPPER (handles Safari private mode)
// ════════════════════════════════════════════════════════════
const safeStorage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch(e) { console.warn('localStorage unavailable:', e); return false; }
  }
};

// ════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════

// Bootstrap localStorage arrays
['users','emergencies','incidents','admins'].forEach(key => {
  if (!safeStorage.get(key)) safeStorage.set(key, []);
});

let currentUser = safeStorage.get('currentUser', null);

// ════════════════════════════════════════════════════════════
// THEME ENGINE
// ════════════════════════════════════════════════════════════

function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const theme = saved || preferred;
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeBtn(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
  });
}

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ════════════════════════════════════════════════════════════

const TOAST_ICONS = { success: '✅', danger: '🚨', warning: '⚠️', info: 'ℹ️' };

function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${TOAST_ICONS[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ════════════════════════════════════════════════════════════
// LIVE CLOCK
// ════════════════════════════════════════════════════════════

function startClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

// ════════════════════════════════════════════════════════════
// AUTH — REGISTER
// ════════════════════════════════════════════════════════════

let generatedOTP = null;
let currentStep = 1;

async function sendOTP() {
  const email  = document.getElementById('reg-email')?.value?.trim();
  const phone  = document.getElementById('reg-phone')?.value?.trim();
  const method = document.querySelector('.otp-method-chip.selected')?.dataset.method || 'email';
  const name   = document.getElementById('reg-name')?.value?.trim() || 'User';

  if (method === 'phone') {
    showToast('📧 Phone OTP unavailable — switching to Email OTP. Please select Email and try again.', 'warning', 5000);
    document.querySelector('[data-method="email"]')?.click();
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address first.', 'warning');
    return;
  }

  // Generate 4-digit OTP
  generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

  // Loading state
  const btn = document.querySelector('[onclick="sendOTP()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Sending…'; }

  // Check EmailJS is configured
  const isConfigured = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

  if (isConfigured && typeof emailjs !== 'undefined') {
    // ── Real email via EmailJS ────────────────────────────────
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { to_email: email, otp_code: generatedOTP, to_name: name },
        EMAILJS_PUBLIC_KEY
      );
      showToast(`✉️ OTP sent to ${email} — check your inbox!`, 'success', 4000);
      goToStep(2);
    } catch (err) {
      console.error('EmailJS error:', err);
      showToast('Failed to send OTP email. Please check your email address.', 'danger');
    }
  } else {
    // ── Demo mode (EmailJS not yet configured) ────────────────
    // Shows OTP in a non-blocking toast instead of an alert
    console.info(`[DEMO] OTP for ${email}: ${generatedOTP}`);
    showToast(`🔐 Demo OTP: ${generatedOTP} (configure EmailJS for real emails)`, 'info', 10000);
    goToStep(2);
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Send Verification Code'; }
}

function goToStep(step) {
  currentStep = step;
  document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.wizard-step-item').forEach((el, i) => {
    if (i + 1 < step) el.classList.add('done');
    else el.classList.remove('done');
    el.classList.toggle('active', i + 1 === step);
  });
  document.querySelectorAll('.wizard-step-line').forEach((el, i) => {
    el.classList.toggle('done', i + 1 < step);
  });

  const stepEl = document.getElementById(`step-${step}`);
  if (stepEl) {
    document.querySelectorAll('.wizard-step-content').forEach(e => e.classList.remove('active'));
    stepEl.classList.add('active');
  }

  // Autofocus first OTP input
  if (step === 2) document.getElementById('otp-1')?.focus();
}

// OTP input auto-advance
function handleOTPInput(el, index) {
  el.classList.toggle('filled', el.value.length > 0);
  if (el.value && index < 4) document.getElementById(`otp-${index + 1}`)?.focus();
}
function handleOTPKeydown(el, index, e) {
  if (e.key === 'Backspace' && !el.value && index > 1) {
    document.getElementById(`otp-${index - 1}`)?.focus();
  }
}

function getOTPValue() {
  return [1,2,3,4].map(i => document.getElementById(`otp-${i}`)?.value || '').join('');
}

// Password strength meter
function checkPasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if (!fill) return;
  const levels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', 'var(--danger)', 'var(--warning)', 'var(--primary)', 'var(--success)'];
  fill.className = `strength-bar-fill strength-${score}`;
  fill.style.background = colors[score];
  if (label) { label.textContent = score > 0 ? levels[score] : ''; label.style.color = colors[score]; }
}

function handleRegister(e) {
  e.preventDefault();
  const otp = getOTPValue();
  if (otp !== generatedOTP) {
    showToast('Invalid OTP code. Please try again.', 'danger');
    [1,2,3,4].forEach(i => {
      const inp = document.getElementById(`otp-${i}`);
      if (inp) { inp.value = ''; inp.classList.remove('filled'); }
    });
    document.getElementById('otp-1')?.focus();
    return;
  }

  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const address  = document.getElementById('reg-address').value.trim();
  const emCon    = document.getElementById('reg-emcontact').value.trim();
  const password = document.getElementById('reg-password').value;

  const users = safeStorage.get('users', []);
  if (users.find(u => u.email === email)) {
    showToast('This email is already registered.', 'danger');
    goToStep(1); return;
  }

  const newUser = {
    id: Date.now(), name, email, phone,
    address, emergencyContact: emCon,
    password, credits: 100,
    joinedAt: new Date().toLocaleDateString()
  };
  users.push(newUser);
  if (!safeStorage.set('users', users)) {
    showToast('Storage error. Try a different browser.', 'danger'); return;
  }

  showToast('🎉 Account created! Redirecting to login…', 'success', 2500);
  setTimeout(() => { window.location.href = 'login.html'; }, 2000);
}

// ════════════════════════════════════════════════════════════
// AUTH — LOGIN
// ════════════════════════════════════════════════════════════

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  // Show loading state
  const btn = e.target.querySelector('[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Signing in…'; }

  const users = safeStorage.get('users', []);
  const user  = users.find(u => u.email?.toLowerCase() === email && u.password === password);

  if (user) {
    safeStorage.set('currentUser', user);
    showToast(`Welcome back, ${user.name}! 🎉`, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  } else {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In to Dashboard'; }
    showToast('Invalid email or password.', 'danger');
    const card = document.querySelector('.auth-form-side');
    card?.classList.add('shake');
    setTimeout(() => card?.classList.remove('shake'), 500);
  }
}

function requireAuth() {
  if (!currentUser) { window.location.href = 'login.html'; }
}

function logout() {
  try { localStorage.removeItem('currentUser'); } catch(e) {}
  // Use relative path — works both on localhost and GitHub Pages
  window.location.href = 'index.html';
}

// Toggle password visibility
function togglePassword(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  if (!input || !btn) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// ════════════════════════════════════════════════════════════
// USER DASHBOARD — NAVIGATION
// ════════════════════════════════════════════════════════════

function switchSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
  // Update breadcrumb
  const label = document.querySelector(`[data-section="${id}"]`)?.querySelector('span:last-child')?.textContent;
  const bc = document.getElementById('breadcrumb-page');
  if (bc && label) bc.textContent = label;
}

// ════════════════════════════════════════════════════════════
// CREDIT SYSTEM
// ════════════════════════════════════════════════════════════

function updateCreditsUI() {
  if (!currentUser) return;
  const pct = (currentUser.credits / 100) * 100;

  // Sidebar credit bar
  const fill = document.getElementById('credit-bar-fill');
  const label = document.getElementById('credit-label-val');
  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = currentUser.credits;

  // Radial arc on dashboard
  const arcFill = document.getElementById('credit-arc-fill');
  if (arcFill) {
    const circumference = 180; // half-circle arc length approx
    const offset = circumference - (circumference * pct / 100);
    arcFill.style.strokeDashoffset = offset;
    arcFill.style.stroke = pct > 40 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--danger)';
  }

  const countEl = document.getElementById('credit-count');
  if (countEl) countEl.textContent = currentUser.credits;

  // SOS button
  const sosBtn = document.getElementById('sos-btn');
  const sosTip = document.getElementById('sos-tip');
  if (sosBtn) {
    if (currentUser.credits <= 0) {
      sosBtn.disabled = true;
      if (sosTip) sosTip.textContent = '⛔ SOS Disabled — Zero credits remaining. Contact authorities.';
      if (sosTip) sosTip.style.color = 'var(--danger)';
    } else {
      sosBtn.disabled = false;
      if (sosTip) sosTip.textContent = 'Hold down to trigger • Misuse = -20 credits';
      if (sosTip) sosTip.style.color = 'var(--text-tertiary)';
    }
  }
}

function saveUserToDB() {
  safeStorage.set('currentUser', currentUser);
  const users = safeStorage.get('users', []);
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx > -1) { users[idx] = currentUser; safeStorage.set('users', users); }
}

// ════════════════════════════════════════════════════════════
// SOS / HELP BUTTON
// ════════════════════════════════════════════════════════════

let sosConfirming = false;

function triggerSOS() {
  if (!currentUser || currentUser.credits <= 0) {
    showToast('SOS Disabled. Zero credits remaining.', 'danger'); return;
  }

  if (!sosConfirming) {
    // First click — confirm
    sosConfirming = true;
    const btn = document.getElementById('sos-btn');
    if (btn) { btn.style.animation = 'none'; btn.querySelector('.sos-btn-label').textContent = 'HOLD!'; }
    showToast('⚠️ Click again to confirm emergency!', 'warning', 4000);
    setTimeout(() => { sosConfirming = false; const b = document.getElementById('sos-btn'); if(b) { b.querySelector('.sos-btn-label').textContent = 'SOS'; } }, 4000);
    return;
  }

  sosConfirming = false;
  const isMisuse = confirm('DEMO SIMULATION:\n\nIs this a real emergency?\n\n✅ OK = Real Emergency\n❌ Cancel = False Alarm (misuse → -20 credits)');

  if (!isMisuse) {
    currentUser.credits = Math.max(0, currentUser.credits - 20);
    saveUserToDB();
    updateCreditsUI();
    showToast('⚠️ False alarm recorded. -20 credits deducted. Legal action may follow.', 'danger', 5000);
    if (currentUser.credits <= 0) return;
  }

  // Get geolocation
  showToast('📍 Locating your position…', 'info', 2000);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => dispatchSOS(pos.coords.latitude, pos.coords.longitude),
      ()  => dispatchSOS('Unknown', 'Unknown')
    );
  } else {
    dispatchSOS('Not Supported', 'Not Supported');
  }
}

function dispatchSOS(lat, lng) {
  const emergencies = safeStorage.get('emergencies', []);
  const request = {
    id: Date.now(),
    userId: currentUser.id,
    userName: currentUser.name,
    location: (lat === 'Unknown' || lat === 'Not Supported') ? 'Location unavailable' : `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`,
    address: currentUser.address,
    contact: currentUser.phone,
    emergencyContact: currentUser.emergencyContact,
    time: new Date().toLocaleString(),
    status: 'Emergency'
  };
  emergencies.unshift(request);
  safeStorage.set('emergencies', emergencies);

  // Show success state on button
  const btn = document.getElementById('sos-btn');
  if (btn) { btn.querySelector('.sos-btn-label').textContent = '✓'; btn.style.background = 'radial-gradient(circle at 35% 35%, #10b981, #065f46)'; }
  setTimeout(() => { if (btn) { btn.querySelector('.sos-btn-label').textContent = 'SOS'; btn.style.background = ''; } }, 4000);

  showToast('🚨 Emergency alert dispatched to authorities!', 'success', 5000);
}

// ════════════════════════════════════════════════════════════
// INCIDENT REPORT
// ════════════════════════════════════════════════════════════

var selectedIncidentType = '';
var _incidentPhotoData  = { src: null, name: null }; // global: accessible across all script tags

function selectIncidentType(type) {
  selectedIncidentType = type;
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected', 'danger-chip', 'warning-chip'));
  const chip = document.querySelector(`[data-type="${type}"]`);
  if (chip) {
    chip.classList.add('selected');
    if (type === 'Fire' || type === 'Accident') chip.classList.add('danger-chip');
    else if (type === 'Flood') chip.classList.add('warning-chip');
  }
}

function handleIncidentReport(e) {
  e.preventDefault();
  if (!selectedIncidentType) { showToast('Please select an incident type.', 'warning'); return; }

  const location = document.getElementById('incident-location').value.trim();
  const desc     = document.getElementById('incident-desc').value.trim();
  const severity = document.getElementById('incident-severity').value;

  const incidents = safeStorage.get('incidents', []);
  incidents.unshift({
    id: Date.now(),
    type: selectedIncidentType,
    location, description: desc, severity,
    reportedBy: currentUser.name,
    userName: currentUser.name,
    userId: currentUser.id,
    time: new Date().toLocaleString(),
    status: 'reported',
    photo:     _incidentPhotoData.src  || null,
    photoName: _incidentPhotoData.name || null
  });
  safeStorage.set('incidents', incidents);

  // Reset everything
  showToast(`${selectedIncidentType} incident reported. Authorities alerted.`, 'success');
  e.target.reset();
  selectedIncidentType = '';
  _incidentPhotoData = { src: null, name: null };
  document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected','danger-chip','warning-chip'));
  const resetPreview    = document.getElementById('image-preview');
  const resetPreviewBox = document.getElementById('image-preview-box');
  const resetUploadZone = document.getElementById('upload-zone');
  if (resetPreview)    resetPreview.src = '';
  if (resetPreviewBox) resetPreviewBox.style.display = 'none';
  if (resetUploadZone) resetUploadZone.style.display = 'block';
  switchSection('sec-home');
}

// ════════════════════════════════════════════════════════════
// DISASTER PREDICTION SIMULATOR
// ════════════════════════════════════════════════════════════

const DISASTER_TYPES = [
  { name: 'Earthquake', emoji: '🌍', severity: 'CRITICAL', tip: 'Drop, Cover, Hold On. Move away from windows.' },
  { name: 'Tsunami',    emoji: '🌊', severity: 'CRITICAL', tip: 'Move to higher ground immediately. Do not wait.' },
  { name: 'Flash Flood',emoji: '💧', severity: 'HIGH',     tip: 'Do not enter floodwaters. Move to elevated ground.' },
  { name: 'Wildfire',   emoji: '🔥', severity: 'HIGH',     tip: 'Evacuate immediately. Follow official routes.' },
  { name: 'Cyclone',    emoji: '🌀', severity: 'SEVERE',   tip: 'Stay indoors. Board up windows. Stock supplies.' },
];

function simulateDisasterPrediction() {
  const disaster = DISASTER_TYPES[Math.floor(Math.random() * DISASTER_TYPES.length)];
  const alertArea = document.getElementById('prediction-alerts');
  if (!alertArea) return;

  const alertEl = document.createElement('div');
  alertEl.className = 'alert-banner danger';
  alertEl.innerHTML = `
    <span class="alert-banner-icon">${disaster.emoji}</span>
    <div class="alert-banner-content">
      <div class="alert-banner-title">AI EARLY WARNING: ${disaster.name} — ${disaster.severity}</div>
      <div class="alert-banner-body">${disaster.tip} · Predicted time: Next 2-4 hours</div>
    </div>
    <button class="alert-banner-close" onclick="this.parentElement.remove()">✕</button>
  `;
  alertArea.prepend(alertEl);
  showToast(`🚨 ${disaster.name} warning issued for your area!`, 'danger', 6000);

  // Also add to admin emergencies as a prediction alert
  const emergencies = safeStorage.get('emergencies', []);
  emergencies.unshift({
    id: Date.now(),
    userId: 'SYSTEM',
    userName: '🤖 AI Prediction System',
    location: 'Regional Broadcast',
    address: 'All Zones',
    contact: 'System Generated',
    time: new Date().toLocaleString(),
    status: 'Prediction Alert',
    type: disaster.name
  });
  safeStorage.set('emergencies', emergencies);
}

// ════════════════════════════════════════════════════════════
// DASHBOARD INIT
// ════════════════════════════════════════════════════════════

function initDashboard() {
  requireAuth();
  // Greet user
  const el = n => document.getElementById(n);
  if (el('user-greeting'))  el('user-greeting').textContent  = currentUser.name;
  if (el('user-initial'))   el('user-initial').textContent   = currentUser.name.charAt(0).toUpperCase();
  if (el('profile-name'))   el('profile-name').textContent   = currentUser.name;
  if (el('profile-email'))  el('profile-email').textContent  = currentUser.email;
  if (el('profile-phone'))  el('profile-phone').textContent  = currentUser.phone;
  if (el('profile-address'))el('profile-address').textContent= currentUser.address;
  if (el('profile-emcon'))  el('profile-emcon').textContent  = currentUser.emergencyContact;
  if (el('profile-joined')) el('profile-joined').textContent = currentUser.joinedAt || 'Today';

  updateCreditsUI();
  startClock();

  // Animated counters
  animateCounter('stat-disasters', 2, 1200);
  animateCounter('stat-responders', 48, 1500);
  animateCounter('stat-alerts', 7, 1000);
}

function animateCounter(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

// ════════════════════════════════════════════════════════════
// ADMIN LOGIC
// ════════════════════════════════════════════════════════════

function handleAdminLogin(e) {
  e.preventDefault();
  const id   = document.getElementById('admin-id').value.trim();
  const pass = document.getElementById('admin-pass').value;

  let admins = [];
  try { admins = JSON.parse(localStorage.getItem('admins')) || []; } catch(err) {}
  const dynAdmin = admins.find(a => a.adminId === id && a.password === pass);

  if ((id === 'admin' && pass === 'admin123') || dynAdmin) {
    const name = dynAdmin ? dynAdmin.name : 'System Admin';
    const dept = dynAdmin ? dynAdmin.department : 'Central Command';
    document.getElementById('admin-login-overlay').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    if (document.getElementById('admin-officer-name')) document.getElementById('admin-officer-name').textContent = name;
    if (document.getElementById('admin-officer-dept')) document.getElementById('admin-officer-dept').textContent = dept;
    showToast(`Access granted. Welcome, ${name} 👮`, 'success');
    loadAdminStats();
    loadEmergenciesTable();
    loadIncidentsTable();
    startClock();
  } else {
    showToast('Unauthorized access attempt logged.', 'danger');
    const card = document.querySelector('.auth-form-side');
    if (card) { card.style.animation = 'shake 0.4s ease'; setTimeout(() => card.style.animation = '', 400); }
  }
}

function adminLogout() {
  document.getElementById('admin-login-overlay').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-login-form').reset();
  showToast('Logged out of Command Center.', 'info');
}

function switchAdminSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
  const label = document.querySelector(`[data-section="${id}"]`)?.querySelector('span:last-child')?.textContent;
  const bc = document.getElementById('breadcrumb-page');
  if (bc && label) bc.textContent = label;
  if (id === 'admin-emergencies') loadEmergenciesTable();
  if (id === 'admin-incidents')   loadIncidentsTable();
}

function loadAdminStats() {
  const em  = safeStorage.get('emergencies', []);
  const inc = safeStorage.get('incidents',   []);
  const pending  = em.filter(e => e.status === 'Emergency').length;
  const assigned = em.filter(e => e.status === 'Responder Assigned').length;
  const resolved = em.filter(e => e.status === 'Resolved').length;

  const s = id => document.getElementById(id);
  if (s('stat-total-sos'))  s('stat-total-sos').textContent  = em.length;
  if (s('stat-pending'))    s('stat-pending').textContent    = pending;
  if (s('stat-assigned'))   s('stat-assigned').textContent   = assigned;
  if (s('stat-resolved'))   s('stat-resolved').textContent   = resolved;
  if (s('stat-total-inc'))  s('stat-total-inc').textContent  = inc.length;
}

function loadEmergenciesTable() {
  const tbody = document.getElementById('emergencies-body');
  if (!tbody) return;
  const data = safeStorage.get('emergencies', []);
  loadAdminStats();

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No active emergency requests.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(req => {
    const badgeMap = {
      'Emergency': 'badge-emergency badge-dot',
      'Responder Assigned': 'badge-pending',
      'Resolved': 'badge-resolved',
      'Prediction Alert': 'badge-info'
    };
    const badge = badgeMap[req.status] || 'badge-info';
    return `
      <tr>
        <td>
          <div style="font-weight:600">${req.userName}</div>
          <div style="font-size:0.75rem; color:var(--text-tertiary)">☎ ${req.contact || '—'}</div>
        </td>
        <td>
          <div>${req.location}</div>
          <div style="font-size:0.75rem; color:var(--text-tertiary)">${req.address || ''}</div>
        </td>
        <td style="font-size:0.8rem; color:var(--text-secondary)">${req.time}</td>
        <td><span class="badge ${badge}">${req.status}</span></td>
        <td>
          ${req.status !== 'Resolved' ? `
            <button class="btn btn-ghost btn-sm" style="margin-right:6px" onclick="assignResponder(${req.id})">🚑 Dispatch</button>
            <button class="btn btn-success btn-sm" onclick="resolveEmergency(${req.id})">✓ Resolve</button>
          ` : `<span style="color:var(--text-tertiary); font-size:0.8rem">Closed</span>`}
        </td>
      </tr>`;
  }).join('');
}

function assignResponder(id) {
  updateEmergencyStatus(id, 'Responder Assigned');
  showToast('🚑 Nearest responder dispatched successfully!', 'success');
  loadEmergenciesTable();
}

function resolveEmergency(id) {
  updateEmergencyStatus(id, 'Resolved');
  showToast('✅ Emergency marked as resolved.', 'success');
  loadEmergenciesTable();
}

function updateEmergencyStatus(id, status) {
  const data = safeStorage.get('emergencies', []);
  const idx = data.findIndex(d => d.id === id);
  if (idx > -1) { data[idx].status = status; safeStorage.set('emergencies', data); }
}

function loadIncidentsTable() {
  const tbody = document.getElementById('incidents-body');
  if (!tbody) return;
  const data = safeStorage.get('incidents', []);
  loadAdminStats();

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No incident reports logged.</td></tr>`;
    return;
  }

  const sevBadge    = { 'Low':'badge-resolved','Medium':'badge-pending','High':'badge-emergency','Critical':'badge-emergency badge-dot' };
  const statusBadge = { 'Pending':'badge-pending','Dispatched':'badge-info','Declined':'badge-emergency','Verified':'badge-resolved' };

  tbody.innerHTML = data.map((req, idx) => `
    <tr>
      <td><strong>${req.type || 'Unknown'}</strong></td>
      <td style="font-size:0.82rem;">${req.location || '&mdash;'}</td>
      <td>
        <div style="font-weight:600; font-size:0.82rem;">${req.userName || req.reportedBy || '&mdash;'}</div>
        <div style="font-size:0.7rem; color:var(--text-tertiary);">${req.time || ''}</div>
      </td>
      <td style="max-width:180px; font-size:0.82rem; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${req.description || ''}">${req.description || ''}</td>
      <td><span class="badge ${sevBadge[req.severity] || 'badge-info'}">${req.severity || '&mdash;'}</span></td>
      <td><span class="badge ${statusBadge[req.verificationStatus] || 'badge-pending'}">${req.verificationStatus || 'Pending'}</span></td>
      <td style="white-space:nowrap; min-width:120px;">
        ${req.photo
          ? `<button class="btn btn-ghost btn-sm" style="display:block;width:100%;margin-bottom:4px;" onclick="adminViewPhoto(${idx})">View Photo</button>`
          : `<span style="font-size:0.72rem;color:var(--text-tertiary);display:block;margin-bottom:4px;">No photo</span>`
        }
        ${req.verificationStatus === 'Declined'
          ? `<span style="color:var(--text-tertiary);font-size:0.78rem;">Declined</span>`
          : req.verificationStatus === 'Dispatched'
          ? `<span style="color:var(--primary);font-size:0.78rem;">Helpers Sent</span>`
          : `<button class="btn btn-primary btn-sm" style="margin-right:3px;" onclick="openDispatchModal(${idx})">Dispatch</button><button class="btn btn-danger btn-sm" onclick="openDeclineModal(${idx})">Decline</button>`
        }
      </td>
    </tr>`).join('');
}

function adminViewPhoto(idx) {
  const data = JSON.parse(localStorage.getItem('incidents')) || [];
  const inc  = data[idx];
  if (!inc || !inc.photo) return;
  const modal = document.getElementById('photo-modal');
  if (!modal) {
    const win = window.open('', '_blank');
    win.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${inc.photo}" style="max-width:100%;max-height:100vh;"><p style="color:#aaa;text-align:center;font-family:sans-serif;">${inc.photoName || ''}</p></body></html>`);
    return;
  }
  document.getElementById('photo-modal-img').src = inc.photo;
  document.getElementById('photo-modal-meta').textContent = inc.photoName || 'Verification photo';
  document.getElementById('photo-modal-reporter').textContent =
    `Reported by: ${inc.userName || inc.reportedBy || 'Unknown'}  \xb7  ${inc.type}  \xb7  ${inc.time}`;
  modal.classList.add('open');
}


// ════════════════════════════════════════════════════════════
// ADMIN REGISTRATION
// ════════════════════════════════════════════════════════════

function handleAdminRegister(e) {
  e.preventDefault();
  const name      = document.getElementById('admin-name').value.trim();
  const adminId   = document.getElementById('admin-badge').value.trim();
  const dept      = document.getElementById('admin-dept').value.trim();
  const pass      = document.getElementById('admin-password').value;
  const clearance = document.getElementById('admin-clearance').value.trim();
  const region    = document.getElementById('admin-region').value.trim();

  if (clearance !== '1234') {
    showToast('Invalid Security Clearance Code!', 'danger'); return;
  }

  const admins = safeStorage.get('admins', []);
  if (admins.find(a => a.adminId === adminId) || adminId.toLowerCase() === 'admin') {
    showToast('This Admin ID is already in use.', 'danger'); return;
  }

  admins.push({ id: Date.now(), name, adminId, department: dept, region, password: pass, createdAt: new Date().toLocaleDateString() });
  safeStorage.set('admins', admins);
  showToast('Government account created! Redirecting…', 'success', 2000);
  setTimeout(() => { window.location.href = 'admin.html'; }, 1800);
}

// ════════════════════════════════════════════════════════════
// DOM READY
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  startClock();

  // Forms
  const f = id => document.getElementById(id);
  f('register-form') ?.addEventListener('submit', handleRegister);
  f('login-form')    ?.addEventListener('submit', handleLogin);
  f('incident-form') ?.addEventListener('submit', handleIncidentReport);
  f('admin-login-form')   ?.addEventListener('submit', handleAdminLogin);
  f('admin-register-form')?.addEventListener('submit', handleAdminRegister);

  // User dashboard
  if (f('sec-home')) initDashboard();

  // Admin dashboard auto-load redirect check
  if (f('admin-dashboard')) {
    // Already handled by admin login overlay
  }

  // Add shake animation style inline
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }
    .shake{animation:shake 0.4s ease!important;}
  `;
  document.head.appendChild(style);
});
