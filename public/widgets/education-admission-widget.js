(function(){
  try {
    var s = document.currentScript;
    var slug = s.getAttribute('data-slug') || '';
    var apiKey = s.getAttribute('data-api-key') || '';
    var apiBase = s.getAttribute('data-api-base') || (location.origin.replace(/:\\d+$/, ':8000') + '/api');
    var targetId = s.getAttribute('data-target') || '';
    var recaptchaSiteKey = s.getAttribute('data-recaptcha-site-key') || '';
    if(!slug){ console.error('Admission widget: missing data-slug'); return; }
    var container = targetId ? document.getElementById(targetId) : null;
    if(!container){ container = document.createElement('div'); s.parentNode.insertBefore(container, s.nextSibling); }

    function el(tag, attrs, children){
      var e = document.createElement(tag);
      if(attrs) Object.keys(attrs).forEach(function(k){ if(k==='style'){ Object.assign(e.style, attrs[k]); } else if(k==='text'){ e.textContent = attrs[k]; } else { e.setAttribute(k, attrs[k]); } });
      (children||[]).forEach(function(c){ e.appendChild(c); });
      return e;
    }

    var box = el('div', { style: { fontFamily: 'sans-serif', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', maxWidth: '420px' } });
    var title = el('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' }, text: 'Admission Application' });
    var msg = el('div', { style: { margin: '8px 0', color: '#2e7d32', display: 'none' } });
    var err = el('div', { style: { margin: '8px 0', color: '#c62828', display: 'none' } });

    var nameInput = el('input', { type:'text', placeholder:'Student name', style:{ width:'100%', padding:'8px', margin:'6px 0' } });
    var emailInput = el('input', { type:'email', placeholder:'Email', style:{ width:'100%', padding:'8px', margin:'6px 0' } });
    var phoneInput = el('input', { type:'text', placeholder:'Phone', style:{ width:'100%', padding:'8px', margin:'6px 0' } });
    var upperIdInput = el('input', { type:'text', placeholder:'Student ID (UPPER)', style:{ width:'100%', padding:'8px', margin:'6px 0' } });
    var classSelect = el('select', { style:{ width:'100%', padding:'8px', margin:'6px 0' } });
    var notesInput = el('textarea', { placeholder:'Notes', style:{ width:'100%', padding:'8px', margin:'6px 0' } });
    var submitBtn = el('button', { type:'button', text:'Apply', style:{ background:'#1976d2', color:'#fff', border:'none', padding:'10px 14px', borderRadius:'4px', cursor:'pointer' } });

    function fetchJSON(url){ return fetch(url).then(function(r){ if(!r.ok) throw new Error('Network'); return r.json(); }); }

    fetchJSON(apiBase + '/public/education/' + slug + '/classes/').then(function(d){
      (d.classes||[]).forEach(function(c){ var o = el('option', { value: c.id, text: c.name }); classSelect.appendChild(o); });
    }).catch(function(){ err.style.display='block'; err.textContent='Failed to load classes'; });

    function ensureRecaptcha(cb){
      if(!recaptchaSiteKey){ cb(null); return; }
      if(window.grecaptcha && window.grecaptcha.execute){ cb(window.grecaptcha); return; }
      var sc = document.getElementById('g-recaptcha-script');
      if(!sc){ sc = document.createElement('script'); sc.id='g-recaptcha-script'; sc.src='https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(recaptchaSiteKey); document.head.appendChild(sc); }
      var tries=0; (function waitReady(){ if(window.grecaptcha && window.grecaptcha.execute){ cb(window.grecaptcha); } else if(tries++>50){ cb(null); } else { setTimeout(waitReady, 100); } })();
    }

    submitBtn.addEventListener('click', function(){
      err.style.display='none'; msg.style.display='none';
      var doSubmit = function(token){
        var headers = { 'Content-Type':'application/json', 'X-API-Key': apiKey };
        if(token){ headers['X-Recaptcha-Token'] = token; }
        var payload = { name: nameInput.value, email: emailInput.value, phone: phoneInput.value, upper_id: (upperIdInput.value||'').toUpperCase(), class_id: classSelect.value, notes: notesInput.value };
        fetch(apiBase + '/public/education/' + slug + '/admissions/', { method:'POST', headers: headers, body: JSON.stringify(payload) })
        .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); })
        .then(function(res){ if(!res.ok){ throw new Error(res.body && res.body.error || 'Failed'); }
          msg.style.display='block'; msg.textContent='Application submitted!'; nameInput.value=''; emailInput.value=''; phoneInput.value=''; upperIdInput.value=''; notesInput.value='';
        }).catch(function(ex){ err.style.display='block'; err.textContent= ex.message || 'Error'; });
      };
      ensureRecaptcha(function(gr){
        if(gr && recaptchaSiteKey){ gr.ready(function(){ gr.execute(recaptchaSiteKey, { action: 'admission' }).then(doSubmit); }); }
        else { doSubmit(null); }
      });
    });

    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(err);
    box.appendChild(nameInput);
    box.appendChild(emailInput);
    box.appendChild(phoneInput);
    box.appendChild(upperIdInput);
    box.appendChild(classSelect);
    box.appendChild(notesInput);
    box.appendChild(submitBtn);
    container.appendChild(box);
  } catch(e){ console.error('Admission widget error', e); }
})();


