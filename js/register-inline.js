function selectOTPMethod(m) {
      document.querySelectorAll('.otp-method-chip').forEach(c => c.classList.remove('selected'));
      document.querySelector(`[data-method="${m}"]`)?.classList.add('selected');
    }
    const _goToStep = goToStep;
    goToStep = function(step) {
      _goToStep(step);
      document.querySelectorAll('.wizard-step-content').forEach(el => el.style.display = 'none');
      const target = document.getElementById(`step-${step}`);
      if (target) target.style.display = 'block';
    };
    const origGTS = goToStep;
    goToStep = function(step) {
      origGTS(step);
      [1,2].forEach(i => {
        const item = document.getElementById(`wstep-${i}`);
        if(!item) return;
        item.classList.remove('active','done');
        if(i < step) item.classList.add('done');
        if(i === step) item.classList.add('active');
      });
      const line = document.getElementById('wline-1');
      if(line) line.classList.toggle('done', step > 1);
    };