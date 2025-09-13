(function(){
  try {
    var s = document.currentScript;
    var slug = s.getAttribute('data-slug') || s.getAttribute('data-tenant') || '';
    var apiKey = s.getAttribute('data-api-key') || '';
    var apiBase = s.getAttribute('data-api-base') || (location.origin.replace(/:\\d+$/, ':8000') + '/api');
    var targetId = s.getAttribute('data-target') || '';
    var recaptchaSiteKey = s.getAttribute('data-recaptcha-site-key') || '';
    try {
      var qs = new URLSearchParams(window.location.search);
      if (qs.get('slug')) slug = qs.get('slug');
      if (qs.get('api_key')) apiKey = qs.get('api_key');
      if (qs.get('api_base')) apiBase = qs.get('api_base');
      if (qs.get('recaptcha_site_key')) recaptchaSiteKey = qs.get('recaptcha_site_key');
    } catch(_) {}
    if(!slug){ console.error('Salon widget: missing data-slug'); return; }
    var container = targetId ? document.getElementById(targetId) : null;
    if(!container){ container = document.createElement('div'); s.parentNode.insertBefore(container, s.nextSibling); }

    function el(tag, attrs, children){
      var e = document.createElement(tag);
      if(attrs) Object.keys(attrs).forEach(function(k){ if(k==='style'){ Object.assign(e.style, attrs[k]); } else if(k==='text'){ e.textContent = attrs[k]; } else { e.setAttribute(k, attrs[k]); } });
      (children||[]).forEach(function(c){ e.appendChild(c); });
      return e;
    }

    var box = el('div', { style: { fontFamily: 'sans-serif', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', maxWidth: '420px' } });
    var title = el('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' }, text: 'Book an Appointment' });
    var form = el('form', { });
    var msg = el('div', { style: { margin: '8px 0', color: '#2e7d32', display: 'none' } });
    var err = el('div', { style: { margin: '8px 0', color: '#c62828', display: 'none' } });

    var nameInput = el('input', { type: 'text', placeholder: 'Your name', required: 'true', style: { width: '100%', padding: '8px', margin: '6px 0' } });
    var phoneInput = el('input', { type: 'tel', placeholder: 'Mobile number', required: 'true', style: { width: '100%', padding: '8px', margin: '6px 0' } });
    var serviceSelect = el('select', { required: 'true', style: { width: '100%', padding: '8px', margin: '6px 0' } });
    var stylistSelect = el('select', { required: 'true', style: { width: '100%', padding: '8px', margin: '6px 0' } });
    var startInput = el('input', { type: 'datetime-local', required: 'true', style: { width: '100%', padding: '8px', margin: '6px 0' } });
    var submitBtn = el('button', { type: 'submit', style: { background: '#1976d2', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer' } , text: 'Book' });

    // Service duration cache and datetime helpers
    var serviceDurations = {};
    function pad2(n){ return (n < 10 ? '0' : '') + n; }
    function toIsoLocal(val){
      if(!val) return '';
      if(val.indexOf('T') !== -1) return val;
      var m = /^([0-3]?\d)-([0-1]?\d)-(\d{4})\s+([0-1]?\d):([0-5]\d)\s*(AM|PM)$/i.exec(val);
      if(m){
        var dd = parseInt(m[1],10), mm = parseInt(m[2],10), yyyy = parseInt(m[3],10);
        var hh = parseInt(m[4],10), min = parseInt(m[5],10), ap = m[6].toUpperCase();
        if(ap === 'PM' && hh < 12) hh += 12;
        if(ap === 'AM' && hh === 12) hh = 0;
        return yyyy + '-' + pad2(mm) + '-' + pad2(dd) + 'T' + pad2(hh) + ':' + pad2(min);
      }
      // fallback: try Date.parse
      var d = new Date(val);
      if(!isNaN(d.getTime())){
        return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
      }
      return val; // send whatever was provided
    }
    function addMinutesIso(iso, minutes){
      try{
        var d = new Date(iso);
        if(isNaN(d.getTime())) return iso;
        d = new Date(d.getTime() + (minutes * 60000));
        return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
      } catch(_) { return iso; }
    }

    form.appendChild(nameInput);
    form.appendChild(phoneInput);
    form.appendChild(serviceSelect);
    form.appendChild(stylistSelect);
    form.appendChild(startInput);
    form.appendChild(submitBtn);

    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(err);
    box.appendChild(form);
    container.appendChild(box);

    function fetchJSON(url){
      return fetch(url).then(function(r){ if(!r.ok) throw new Error('Network'); return r.json(); });
    }

    // Load services and stylists
    fetchJSON(apiBase + '/public/salon/' + slug + '/services/').then(function(d){
      (d.services||[]).forEach(function(s){
        serviceDurations[String(s.id)] = s.duration_minutes || 30;
        var o = el('option', { value: s.id, text: s.name + ' (' + (s.duration_minutes||30) + 'm)' }); serviceSelect.appendChild(o);
      });
    }).catch(function(){ err.style.display='block'; err.textContent='Failed to load services'; });

    fetchJSON(apiBase + '/public/salon/' + slug + '/stylists/').then(function(d){
      (d.stylists||[]).forEach(function(st){ var o = el('option', { value: st.id, text: st.first_name + ' ' + (st.last_name||'') }); stylistSelect.appendChild(o); });
    }).catch(function(){ err.style.display='block'; err.textContent='Failed to load stylists'; });

    function ensureRecaptcha(cb){
      if(!recaptchaSiteKey){ cb(null); return; }
      if(window.grecaptcha && window.grecaptcha.execute){ cb(window.grecaptcha); return; }
      var scriptId = 'g-recaptcha-script';
      if(!document.getElementById(scriptId)){
        var sc = document.createElement('script');
        sc.id = scriptId;
        sc.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(recaptchaSiteKey);
        document.head.appendChild(sc);
      }
      var tries = 0;
      (function waitReady(){
        if(window.grecaptcha && window.grecaptcha.execute){ cb(window.grecaptcha); return; }
        if(tries++ > 50){ cb(null); return; }
        setTimeout(waitReady, 100);
      })();
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      err.style.display='none'; msg.style.display='none';
      var doSubmit = function(token){
        var headers = { 'Content-Type': 'application/json', 'X-API-Key': apiKey };
        var startIso = toIsoLocal(startInput.value);
        var durationMin = serviceDurations[String(serviceSelect.value)] || 30;
        var endIso = addMinutesIso(startIso, durationMin);
        var payload = {
          customer_name: nameInput.value,
          customer_phone: phoneInput.value,
          service: serviceSelect.value,
          stylist: stylistSelect.value,
          start_time: startIso,
          end_time: endIso
        };
        if(token){ headers['X-Recaptcha-Token'] = token; }
        fetch(apiBase + '/public/salon/' + slug + '/appointments/', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        }).then(function(r){ return r.json().then(function(j){ return { ok: r.ok, status: r.status, body: j }; }); })
        .then(function(res){
          if(!res.ok){
            if(res.status === 403 && res.body && res.body.error){ err.style.display='block'; err.textContent = 'Bookings are currently closed.'; return; }
            throw new Error(res.body && res.body.error || 'Failed');
          }
          msg.style.display='block'; msg.textContent='Appointment booked!';
          form.reset();
        }).catch(function(ex){ err.style.display='block'; err.textContent= ex.message || 'Error'; });
      };
      ensureRecaptcha(function(gr){
        if(gr && recaptchaSiteKey){ gr.ready(function(){ gr.execute(recaptchaSiteKey, { action: 'book' }).then(doSubmit); }); }
        else { doSubmit(null); }
      });
    });
  } catch(e){ console.error('Salon widget error', e); }
})();


