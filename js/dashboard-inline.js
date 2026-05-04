const _origInit = initDashboard;
    initDashboard = function () {
      _origInit();
      const hEl = document.getElementById('user-greeting-h1');
      if (hEl && currentUser) hEl.textContent = currentUser.name.split(' ')[0];

      const av = document.getElementById('profile-avatar');
      if (av && currentUser) av.textContent = currentUser.name.charAt(0).toUpperCase();

      const pc = document.getElementById('profile-credits');
      if (pc && currentUser) pc.textContent = currentUser.credits;

      const em = JSON.parse(localStorage.getItem('emergencies')) || [];
      const inc = JSON.parse(localStorage.getItem('incidents')) || [];
      const myEm = em.filter(e => e.userId === currentUser.id);
      const myInc = inc.filter(i => i.userId === currentUser.id);
      const a1 = document.getElementById('activity-sos');
      const a2 = document.getElementById('activity-reports');
      if (a1) a1.textContent = myEm.length;
      if (a2) a2.textContent = myInc.length;

      const mirror = document.getElementById('prediction-alerts-page');
      const main = document.getElementById('prediction-alerts');
      if (mirror && main) {
        const obs = new MutationObserver(() => { mirror.innerHTML = main.innerHTML; });
        obs.observe(main, { childList: true });
      }
    };
    initDashboard();

    // ── Real-time timestamp ──
    function updateReportTimestamp() {
      const el = document.getElementById('report-timestamp');
      if (!el) return;
      const now = new Date();
      el.textContent = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateReportTimestamp();
    setInterval(updateReportTimestamp, 1000);

    // ── GPS Location detection ──
    let incidentLatLng = null;
    function detectLocation() {
      const gpsEl = document.getElementById('report-gps');
      const addrEl = document.getElementById('report-gps-address');
      if (!gpsEl) return;
      gpsEl.textContent = 'Detecting…';
      addrEl.textContent = 'Fetching address…';
      if (!navigator.geolocation) {
        gpsEl.textContent = 'Not supported';
        addrEl.textContent = 'Your browser does not support GPS.';
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          incidentLatLng = { lat, lng };
          gpsEl.textContent = `${lat}, ${lng}`;
          // Reverse geocode using browser-native fetch (no key needed via OpenStreetMap)
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            .then(r => r.json())
            .then(data => {
              const addr = data.display_name || 'Address unavailable';
              addrEl.textContent = addr.length > 80 ? addr.substring(0, 80) + '…' : addr;
              // Auto-fill the location field if empty
              const locInput = document.getElementById('incident-location');
              if (locInput && !locInput.value) locInput.value = addr.split(',').slice(0, 3).join(', ');
            })
            .catch(() => { addrEl.textContent = `Lat: ${lat}, Lng: ${lng}`; });
        },
        err => {
          gpsEl.textContent = 'Access denied';
          addrEl.textContent = 'Please allow location access in your browser.';
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    // Auto-detect on page load when Report section becomes visible
    const _origSwitch = switchSection;
    switchSection = function (id) {
      _origSwitch(id);
      if (id === 'sec-report') detectLocation();
    };
    // Also detect on first view if already on report section
    if (document.getElementById('sec-report')?.classList.contains('active')) detectLocation();

    // ── Image upload handler ──
    function handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB.', 'danger');
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target.result;
        // Store in global variable — read at form submit time
        _incidentPhotoData = { src: dataUrl, name: `${file.name} (${(file.size / 1024).toFixed(1)} KB)` };
        // Update preview UI
        document.getElementById('image-preview').src = dataUrl;
        document.getElementById('image-name').textContent = _incidentPhotoData.name;
        document.getElementById('image-preview-box').style.display = 'block';
        document.getElementById('upload-zone').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
    function removeImage() {
      _incidentPhotoData = { src: null, name: null };
      document.getElementById('incident-image').value = '';
      document.getElementById('image-preview').src = '';
      document.getElementById('image-preview-box').style.display = 'none';
      document.getElementById('upload-zone').style.display = 'block';
    }
    function resetReportForm() {
      selectedIncidentType = '';
      _incidentPhotoData = { src: null, name: null };
      document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected', 'danger-chip', 'warning-chip'));
      removeImage();
    }

    // ════════════════════════════════
    // LIVE MAP — Leaflet.js
    // ════════════════════════════════
    var _liveMap = null;
    var _mapMarkers = [];
    var _mapRefreshTimer = null;
    var _userMapLatLng = [20.5937, 78.9629]; // Default: center of India

    // Simulated AI prediction zones (lat, lng, radius km, label)
    var AI_ZONES = [
      { lat: 19.076, lng: 72.877, r: 12000, label: 'Flood Risk Zone — Mumbai coast', color: '#f59e0b' },
      { lat: 28.704, lng: 77.102, r: 10000, label: 'Heat Wave Advisory — Delhi NCR', color: '#ef4444' },
      { lat: 13.082, lng: 80.270, r: 8000, label: 'Cyclone Watch — Chennai Bay', color: '#8b5cf6' },
    ];

    function initLiveMap() {
      if (_liveMap) return; // already initialised
      _liveMap = L.map('live-map', { zoomControl: true }).setView(_userMapLatLng, 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(_liveMap);

      // Draw AI prediction zones
      AI_ZONES.forEach(z => {
        L.circle([z.lat, z.lng], {
          radius: z.r, color: z.color, fillColor: z.color,
          fillOpacity: 0.12, weight: 2, dashArray: '6'
        }).addTo(_liveMap).bindPopup(`<b>AI Prediction</b><br>${z.label}`);
      });

      // Try to get user GPS and center map
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          _userMapLatLng = [pos.coords.latitude, pos.coords.longitude];
          _liveMap.setView(_userMapLatLng, 11);
          L.circleMarker(_userMapLatLng, {
            radius: 10, color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9, weight: 3
          }).addTo(_liveMap).bindPopup('<b>Your Location</b>').openPopup();
        });
      }

      refreshLiveMap();
      _mapRefreshTimer = setInterval(refreshLiveMap, 30000);
    }

    function refreshLiveMap() {
      if (!_liveMap) return;
      // Clear old incident markers
      _mapMarkers.forEach(m => _liveMap.removeLayer(m));
      _mapMarkers = [];

      const incidents = JSON.parse(localStorage.getItem('incidents')) || [];
      const emergencies = JSON.parse(localStorage.getItem('emergencies')) || [];

      // Plot incidents from localStorage — use GPS if available, else random near user
      incidents.forEach((inc, i) => {
        const base = _userMapLatLng;
        const lat = base[0] + (Math.random() - 0.5) * 0.4;
        const lng = base[1] + (Math.random() - 0.5) * 0.4;
        const color = inc.verificationStatus === 'Declined' ? '#6366f1'
          : inc.severity === 'Critical' || inc.severity === 'High' ? '#ef4444'
            : '#f59e0b';
        const m = L.circleMarker([lat, lng], {
          radius: 9, color, fillColor: color, fillOpacity: 0.85, weight: 2
        }).addTo(_liveMap)
          .bindPopup(`<b>${inc.type}</b> — ${inc.severity || 'Unknown'}<br>${inc.location || ''}<br><small>by ${inc.userName || inc.reportedBy || ''}</small>`);
        _mapMarkers.push(m);
      });

      // Plot SOS emergencies
      emergencies.filter(e => e.userId !== 'SYSTEM').forEach(em => {
        const base = _userMapLatLng;
        const lat = base[0] + (Math.random() - 0.5) * 0.3;
        const lng = base[1] + (Math.random() - 0.5) * 0.3;
        const m = L.circleMarker([lat, lng], {
          radius: 11, color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1, weight: 3
        }).addTo(_liveMap)
          .bindPopup(`<b>SOS EMERGENCY</b><br>${em.userName}<br>${em.time}`);
        _mapMarkers.push(m);
      });

      // Update map stats
      const liveCount = incidents.filter(i => i.verificationStatus !== 'Declined').length + emergencies.filter(e => e.status === 'Emergency').length;
      const resCount = incidents.filter(i => i.verificationStatus === 'Dispatched').length + emergencies.filter(e => e.status === 'Resolved').length;
      const s = id => document.getElementById(id);
      if (s('map-stat-live')) s('map-stat-live').textContent = liveCount;
      if (s('map-stat-res')) s('map-stat-res').textContent = resCount;
    }

    // ════════════════════════════════
    // COMMUNITY FEED
    // ════════════════════════════════
    var _communityFilter = 'all';

    function loadCommunityFeed() {
      const container = document.getElementById('community-feed-list');
      if (!container) return;
      let incidents = JSON.parse(localStorage.getItem('incidents')) || [];

      if (_communityFilter !== 'all') {
        incidents = incidents.filter(i => i.type === _communityFilter);
      }

      if (incidents.length === 0) {
        container.innerHTML = `<div class="glass" style="padding:3rem; text-align:center; color:var(--text-tertiary);">No incident reports in the community yet. Be the first to report!</div>`;
        return;
      }

      const sevColor = { 'Critical': 'var(--danger)', 'High': '#f97316', 'Medium': 'var(--warning)', 'Low': 'var(--success)' };
      const statusColor = { 'Dispatched': 'var(--primary)', 'Declined': 'var(--danger)', 'Pending': 'var(--warning)' };

      container.innerHTML = incidents.map(inc => `
        <div class="community-card">
          <div class="community-card-header">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--violet));display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:0.875rem;flex-shrink:0;">
                ${(inc.userName || inc.reportedBy || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:600; font-size:0.875rem;">${inc.userName || inc.reportedBy || 'Anonymous'}</div>
                <div style="font-size:0.72rem; color:var(--text-tertiary);">${inc.time || ''}</div>
              </div>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <span class="badge badge-${inc.type === 'Fire' || inc.type === 'Accident' ? 'emergency' : inc.type === 'Flood' ? 'pending' : 'info'}">${inc.type || 'Unknown'}</span>
              <span style="font-size:0.72rem; font-weight:700; color:${sevColor[inc.severity] || 'var(--text-tertiary)'};">${inc.severity || ''}</span>
            </div>
          </div>
          <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.5rem;">${inc.description || ''}</div>
          <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-tertiary);">
            <span>Location: ${inc.location || 'Not specified'}</span>
            ${inc.verificationStatus ? `<span style="margin-left:auto; color:${statusColor[inc.verificationStatus] || ''}; font-weight:600;">${inc.verificationStatus}</span>` : ''}
          </div>
          ${inc.photo ? `<img class="community-photo" src="${inc.photo}" alt="Incident photo" onclick="viewCommunityPhoto('${inc.id}')">` : ''}
        </div>
      `).join('');
    }

    function filterCommunity(type, btn) {
      _communityFilter = type;
      document.querySelectorAll('[id^="cf-filter-"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      loadCommunityFeed();
    }

    function viewCommunityPhoto(id) {
      const incidents = JSON.parse(localStorage.getItem('incidents')) || [];
      const inc = incidents.find(i => String(i.id) === String(id));
      if (!inc || !inc.photo) return;
      const win = window.open('', '_blank');
      win.document.write(`<html><body style="margin:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;"><img src="${inc.photo}" style="max-width:100%;max-height:90vh;"><p style="color:#aaa;text-align:center;font-family:sans-serif;padding:10px;">${inc.type} — ${inc.location || ''}</p></body></html>`);
    }

    // Hook into switchSection to init map + feed on first open
    const _origSwitchGlobal = switchSection;
    switchSection = function (id) {
      _origSwitchGlobal(id);
      if (id === 'sec-map') {
        setTimeout(() => { initLiveMap(); }, 50); // slight delay so element is visible
      }
      if (id === 'sec-community') loadCommunityFeed();
      if (id === 'sec-report') detectLocation();
    };

    // Auto-refresh community feed every 20s if visible
    setInterval(() => {
      if (document.getElementById('sec-community')?.classList.contains('active')) loadCommunityFeed();
    }, 20000);