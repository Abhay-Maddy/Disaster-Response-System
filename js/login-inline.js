(function(){
      try {
        const u = JSON.parse(localStorage.getItem('currentUser'));
        if (u && u.credits !== undefined) window.location.href = 'dashboard.html';
      } catch(e){}
    })();

    function switchLoginTab(tab) {
      document.getElementById('tab-citizen').classList.toggle('active', tab === 'citizen');
      document.getElementById('tab-admin').classList.toggle('active', tab === 'admin');
      document.getElementById('citizen-login').style.display = tab === 'citizen' ? 'block' : 'none';
      document.getElementById('admin-redirect').style.display = tab === 'admin' ? 'block' : 'none';
    }