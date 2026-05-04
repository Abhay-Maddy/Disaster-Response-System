window.requireAuth = function () { };

    let currentFilter = 'all';
    function filterEmergencies(filter, btn) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadEmergenciesTable();
    }

    const _origLoad = loadEmergenciesTable;
    loadEmergenciesTable = function () {
      const tbody = document.getElementById('emergencies-body');
      if (!tbody) return;
      let data = JSON.parse(localStorage.getItem('emergencies')) || [];
      if (currentFilter !== 'all') data = data.filter(e => e.status === currentFilter);
      loadAdminStats();

      const allData = JSON.parse(localStorage.getItem('emergencies')) || [];
      const pendingCount = allData.filter(e => e.status === 'Emergency').length;
      const badge = document.getElementById('badge-sos');
      if (badge) { badge.textContent = pendingCount; badge.style.display = pendingCount > 0 ? '' : 'none'; }

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No records match this filter.</td></tr>`;
        return;
      }
      const badgeMap = { 'Emergency': 'badge-emergency badge-dot', 'Responder Assigned': 'badge-pending', 'Resolved': 'badge-resolved', 'Prediction Alert': 'badge-info' };
      tbody.innerHTML = data.map(req => `
        <tr>
          <td>
            <div style="font-weight:600">${req.userName}</div>
            <div style="font-size:0.72rem; color:var(--text-tertiary)">${req.contact || '—'}</div>
          </td>
          <td>
            <div>${req.location}</div>
            <div style="font-size:0.72rem; color:var(--text-tertiary)">${req.address || ''}</div>
          </td>
          <td style="font-size:0.8rem; color:var(--text-secondary); white-space:nowrap;">${req.time}</td>
          <td><span class="badge ${badgeMap[req.status] || 'badge-info'}">${req.status}</span></td>
          <td style="white-space:nowrap;">
            ${req.status !== 'Resolved' ? `
              <button class="btn btn-ghost btn-sm" style="margin-right:4px;" onclick="assignResponder(${req.id})">Dispatch</button>
              <button class="btn btn-success btn-sm" onclick="resolveEmergency(${req.id})">Resolve</button>
            ` : `<span style="color:var(--text-tertiary); font-size:0.8rem;">Closed</span>`}
          </td>
        </tr>`).join('');
    };

    // ─── Enhanced loadIncidentsTable with Dispatch + Decline + View Photo ───
    const _origIncLoad = loadIncidentsTable;
    loadIncidentsTable = function () {
      const tbody = document.getElementById('incidents-body');
      if (!tbody) return;
      const data = JSON.parse(localStorage.getItem('incidents')) || [];
      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No incident reports submitted yet.</td></tr>`;
        return;
      }
      const sevBadge = { 'Low': 'badge-resolved', 'Medium': 'badge-pending', 'High': 'badge-emergency', 'Critical': 'badge-emergency badge-dot' };
      const statusBadge = { 'Pending': 'badge-pending', 'Dispatched': 'badge-info', 'Declined': 'badge-emergency', 'Verified': 'badge-resolved' };
      tbody.innerHTML = data.map((inc, idx) => `
        <tr>
          <td><strong>${inc.type || 'Unknown'}</strong></td>
          <td style="font-size:0.82rem; max-width:160px; white-space:normal;">${inc.location || '&#8212;'}</td>
          <td>
            <div style="font-weight:600; font-size:0.82rem;">${inc.userName || inc.reportedBy || '&#8212;'}</div>
            <div style="font-size:0.7rem; color:var(--text-tertiary);">${inc.time || ''}</div>
          </td>
          <td style="max-width:200px; font-size:0.82rem; white-space:normal; color:var(--text-secondary);">${(inc.description || '').substring(0, 100)}${(inc.description || '').length > 100 ? '&#8230;' : ''}</td>
          <td><span class="badge ${sevBadge[inc.severity] || 'badge-info'}">${inc.severity || '&#8212;'}</span></td>
          <td><span class="badge ${statusBadge[inc.verificationStatus] || 'badge-pending'}">${inc.verificationStatus || 'Pending'}</span></td>
          <td style="min-width:130px;">
            ${inc.photo
          ? `<div style="margin-bottom:6px;">
                   <img src="${inc.photo}" alt="Incident photo"
                     style="width:90px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--glass-border);cursor:pointer;"
                     onclick="openPhotoModal(${idx})" title="Click to view full photo">
                   <div style="font-size:0.68rem;color:var(--primary);cursor:pointer;margin-top:3px;text-align:center;" onclick="openPhotoModal(${idx})">View Full</div>
                 </div>`
          : `<span style="font-size:0.72rem;color:var(--text-tertiary);">No photo</span><br>`
        }
            ${inc.verificationStatus === 'Declined' ? `<span style="color:var(--text-tertiary);font-size:0.78rem;">Declined</span>` :
          inc.verificationStatus === 'Dispatched' ? `<span style="color:var(--primary);font-size:0.78rem;">Helpers Sent</span>` : `
              <button class="btn btn-primary btn-sm" style="margin-right:4px;margin-top:4px;" onclick="openDispatchModal(${idx})">Dispatch</button>
              <button class="btn btn-danger btn-sm" style="margin-top:4px;" onclick="openDeclineModal(${idx})">Decline</button>
            `}
          </td>
        </tr>`).join('');
    };

    // ─── Photo Modal Logic ───
    function openPhotoModal(idx) {
      const data = JSON.parse(localStorage.getItem('incidents')) || [];
      const inc = data[idx];
      if (!inc || !inc.photo) return;
      document.getElementById('photo-modal-img').src = inc.photo;
      document.getElementById('photo-modal-meta').textContent = inc.photoName || 'Verification photo';
      document.getElementById('photo-modal-reporter').textContent =
        `Reported by: ${inc.userName || inc.reportedBy || 'Unknown'}  ·  ${inc.type} incident  ·  ${inc.time}`;
      document.getElementById('photo-modal').classList.add('open');
    }
    function closePhotoModal() {
      document.getElementById('photo-modal').classList.remove('open');
      document.getElementById('photo-modal-img').src = '';
    }

    // ─── Dispatch Modal Logic ───
    let _activeIncidentIdx = null;
    let _selectedHelper = 'Fire Brigade';

    function openDispatchModal(idx) {
      _activeIncidentIdx = idx;
      const data = JSON.parse(localStorage.getItem('incidents')) || [];
      const inc = data[idx];
      if (!inc) return;
      document.getElementById('dispatch-incident-summary').textContent = `${inc.type} — ${inc.severity} severity`;
      document.getElementById('dispatch-incident-location').textContent = inc.location || '—';
      // Auto-suggest helper based on type
      const autoMap = { 'Fire': 'Fire Brigade', 'Flood': 'Flood Rescue', 'Medical': 'Medical Team', 'Accident': 'Ambulance' };
      const suggested = autoMap[inc.type] || 'NDRF Team';
      document.querySelectorAll('.dispatch-helper-chip').forEach(c => {
        c.classList.toggle('selected', c.dataset.helper === suggested);
      });
      _selectedHelper = suggested;
      // Auto-fill message
      document.getElementById('dispatch-message').value =
        `Urgent: ${inc.type} incident reported at ${inc.location}. Severity: ${inc.severity}. Please respond immediately.`;
      document.getElementById('dispatch-modal').classList.add('open');
    }
    function closeDispatchModal() {
      document.getElementById('dispatch-modal').classList.remove('open');
      _activeIncidentIdx = null;
    }
    function selectHelper(btn) {
      document.querySelectorAll('.dispatch-helper-chip').forEach(c => c.classList.remove('selected'));
      btn.classList.add('selected');
      _selectedHelper = btn.dataset.helper;
    }
    function confirmDispatch() {
      if (_activeIncidentIdx === null) return;
      const msg = document.getElementById('dispatch-message').value.trim();
      const priority = document.getElementById('dispatch-priority').value;
      if (!msg) { showToast('Please enter a message for helpers.', 'warning'); return; }
      const data = JSON.parse(localStorage.getItem('incidents')) || [];
      data[_activeIncidentIdx].verificationStatus = 'Dispatched';
      data[_activeIncidentIdx].dispatchedTo = _selectedHelper;
      data[_activeIncidentIdx].dispatchMessage = msg;
      data[_activeIncidentIdx].dispatchPriority = priority;
      data[_activeIncidentIdx].dispatchTime = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('incidents', JSON.stringify(data));
      closeDispatchModal();
      loadIncidentsTable();
      showToast(`${_selectedHelper} dispatched successfully.`, 'success');
    }

    // ─── Decline / Fake Modal Logic ───
    let _declineIdx = null;
    function openDeclineModal(idx) {
      _declineIdx = idx;
      const data = JSON.parse(localStorage.getItem('incidents')) || [];
      const inc = data[idx];
      if (!inc) return;
      document.getElementById('decline-incident-summary').textContent =
        `${inc.type} at ${inc.location} — reported by ${inc.userName}`;
      document.getElementById('decline-modal').classList.add('open');
    }
    function closeDeclineModal() {
      document.getElementById('decline-modal').classList.remove('open');
      _declineIdx = null;
    }
    function confirmDecline() {
      if (_declineIdx === null) return;
      const incidentData = JSON.parse(localStorage.getItem('incidents')) || [];
      const inc = incidentData[_declineIdx];
      const reason = document.getElementById('decline-reason').value;
      const notes = document.getElementById('decline-notes').value.trim();
      // Mark incident as declined
      incidentData[_declineIdx].verificationStatus = 'Declined';
      incidentData[_declineIdx].declineReason = reason;
      incidentData[_declineIdx].declineNotes = notes;
      localStorage.setItem('incidents', JSON.stringify(incidentData));
      // Deduct 20 credits from the reporter
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIdx = users.findIndex(u => u.id === inc.userId);
      if (userIdx !== -1) {
        users[userIdx].credits = Math.max(0, (users[userIdx].credits || 100) - 20);
        localStorage.setItem('users', JSON.stringify(users));
        // If logged-in user is the same, update currentUser too
        try {
          const cu = JSON.parse(localStorage.getItem('currentUser'));
          if (cu && cu.id === inc.userId) {
            cu.credits = users[userIdx].credits;
            localStorage.setItem('currentUser', JSON.stringify(cu));
          }
        } catch (e) { }
        showToast(`Report declined. 20 credits deducted from ${inc.userName}.`, 'danger');
      } else {
        showToast(`Report declined.`, 'warning');
      }
      closeDeclineModal();
      loadIncidentsTable();
      loadAdminStats();
    }

    const _origStats = loadAdminStats;
    loadAdminStats = function () {
      _origStats();
      const em = JSON.parse(localStorage.getItem('emergencies')) || [];
      const inc = JSON.parse(localStorage.getItem('incidents')) || [];
      const s = id => document.getElementById(id);
      if (s('stats-total-sos2')) s('stats-total-sos2').textContent = em.length;
      if (s('stats-resolved2')) s('stats-resolved2').textContent = em.filter(e => e.status === 'Resolved').length;
      if (s('stats-assigned2')) s('stats-assigned2').textContent = em.filter(e => e.status === 'Responder Assigned').length;
      if (s('stats-incidents2')) s('stats-incidents2').textContent = inc.length;

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const ul = document.getElementById('users-list');
      if (ul) {
        if (users.length === 0) { ul.innerHTML = '<p style="color:var(--text-tertiary);">No citizens registered yet.</p>'; return; }
        ul.innerHTML = users.map(u => `
          <div style="display:flex; align-items:center; gap:10px; padding:10px; background:var(--glass-bg); border-radius:8px; border:1px solid var(--glass-border);">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--violet));display:flex;align-items:center;justify-content:center;font-weight:700;color:white;flex-shrink:0;font-size:0.875rem;">${u.name.charAt(0)}</div>
            <div style="min-width:0;">
              <div style="font-weight:600; font-size:0.875rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.name}</div>
              <div style="font-size:0.72rem; color:var(--text-tertiary);">${u.email} · <span style="color:${(u.credits || 100) < 40 ? 'var(--danger)' : 'var(--success)'}; font-weight:700;">${u.credits !== undefined ? u.credits : 100} credits</span></div>
            </div>
          </div>`).join('');
      }
    };

    const origSwitch = switchAdminSection;
    switchAdminSection = function (id) {
      origSwitch(id);
      if (id === 'admin-stats') loadAdminStats();
      if (id === 'admin-incidents') loadIncidentsTable();
    };