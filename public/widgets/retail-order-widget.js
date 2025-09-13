(function(){
  try {
    var s = document.currentScript;
    var slug = s.getAttribute('data-slug') || s.getAttribute('data-tenant') || '';
    var apiKey = s.getAttribute('data-api-key') || '';
    var apiBase = s.getAttribute('data-api-base') || (location.origin.replace(/:\\d+$/, ':8000') + '/api');
    var targetId = s.getAttribute('data-target') || '';
    var recaptchaSiteKey = s.getAttribute('data-recaptcha-site-key') || '';
    if(!slug){ console.error('Retail widget: missing data-slug'); return; }
    var container = targetId ? document.getElementById(targetId) : null;
    if(!container){ container = document.createElement('div'); s.parentNode.insertBefore(container, s.nextSibling); }

    function el(tag, attrs, children){
      var e = document.createElement(tag);
      if(attrs) Object.keys(attrs).forEach(function(k){ if(k==='style'){ Object.assign(e.style, attrs[k]); } else if(k==='text'){ e.textContent = attrs[k]; } else { e.setAttribute(k, attrs[k]); } });
      (children||[]).forEach(function(c){ e.appendChild(c); });
      return e;
    }

    var box = el('div', { style: { fontFamily: 'sans-serif', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', maxWidth: '520px' } });
    var title = el('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' }, text: 'Order Products' });
    var msg = el('div', { style: { margin: '8px 0', color: '#2e7d32', display: 'none' } });
    var err = el('div', { style: { margin: '8px 0', color: '#c62828', display: 'none' } });

    var customerName = el('input', { type: 'text', placeholder: 'Your name', style: { width: '49%', padding: '8px', margin: '6px 0' } });
    var customerPhone = el('input', { type: 'text', placeholder: 'Phone', style: { width: '49%', padding: '8px', margin: '6px 0', float: 'right' } });
    var clearFloat = el('div', { style: { clear: 'both' } });

    var list = el('div', { style: { maxHeight: '240px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px', padding: '6px', margin: '6px 0' } });
    var cart = [];
    function addToCart(pid, name){
      var qtyInput = document.getElementById('qty_'+pid);
      var q = parseInt((qtyInput && qtyInput.value) || '1', 10);
      if(!(q>0)) q = 1;
      var idx = cart.findIndex(function(i){ return i.product_id===pid; });
      if(idx>=0){ cart[idx].quantity += q; } else { cart.push({ product_id: pid, quantity: q, name:name }); }
      renderCart();
    }
    var cartBox = el('div', { style: { borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' } });
    function renderCart(){
      cartBox.innerHTML='';
      if(cart.length===0){ cartBox.appendChild(el('div',{text:'Cart is empty'})); return; }
      cart.forEach(function(i,idx){
        var row = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } }, [
          el('div', { text: i.name + ' x ' + i.quantity }),
          el('button', { type:'button', text: 'Remove', style: { background:'#eee', border:'none', padding:'4px 8px', cursor:'pointer' } })
        ]);
        row.lastChild.addEventListener('click', function(){ cart.splice(idx,1); renderCart(); });
        cartBox.appendChild(row);
      });
    }

    function fetchJSON(url){ return fetch(url).then(function(r){ if(!r.ok) throw new Error('Network'); return r.json(); }); }
    function loadProducts(){
      fetchJSON(apiBase + '/public/retail/' + slug + '/products/').then(function(d){
        list.innerHTML='';
        (d.products||[]).forEach(function(p){
          var row = el('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f1f1f1', padding:'6px 0' } }, [
            el('div', { text: p.name + ' (' + p.sku + ')' }),
            el('div', null, [
              el('input', { id: 'qty_'+p.id, type:'number', value:'1', min:'1', style:{ width:'64px', marginRight:'6px' } }),
              el('button', { type:'button', text:'Add', style:{ background:'#1976d2', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'4px', cursor:'pointer' } })
            ])
          ]);
          row.querySelector('button').addEventListener('click', function(){ addToCart(p.id, p.name); });
          list.appendChild(row);
        });
      }).catch(function(){ err.style.display='block'; err.textContent='Failed to load products'; });
    }

    var submitBtn = el('button', { type:'button', text:'Place Order', style:{ background:'#388e3c', color:'#fff', border:'none', padding:'10px 14px', borderRadius:'4px', cursor:'pointer', marginTop:'8px' } });
    function ensureRecaptcha(cb){
      if(!recaptchaSiteKey){ cb(null); return; }
      if(window.grecaptcha && window.grecaptcha.execute){ cb(window.grecaptcha); return; }
      var sc = document.getElementById('g-recaptcha-script');
      if(!sc){ sc = document.createElement('script'); sc.id='g-recaptcha-script'; sc.src='https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(recaptchaSiteKey); document.head.appendChild(sc); }
      var tries=0; (function waitReady(){ if(window.grecaptcha && window.grecaptcha.execute){ cb(window.grecaptcha); } else if(tries++>50){ cb(null); } else { setTimeout(waitReady, 100); } })();
    }

    submitBtn.addEventListener('click', function(){
      err.style.display='none'; msg.style.display='none';
      if(cart.length===0){ err.style.display='block'; err.textContent='Cart is empty'; return; }
      var doSubmit = function(token){
        var headers = { 'Content-Type': 'application/json', 'X-API-Key': apiKey };
        if(token){ headers['X-Recaptcha-Token'] = token; }
        var payload = { items: cart.map(function(i){ return { product:i.product_id, quantity:i.quantity }; }), customer: { name: customerName.value, phone: customerPhone.value } };
        fetch(apiBase + '/public/retail/' + slug + '/orders/', {
          method: 'POST', headers: headers, body: JSON.stringify(payload)
        }).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); }).then(function(res){
          if(!res.ok){ throw new Error(res.body && res.body.error || 'Failed'); }
          msg.style.display='block'; msg.textContent='Order received! Our team will confirm shortly.';
          cart = []; renderCart();
        }).catch(function(ex){ err.style.display='block'; err.textContent= ex.message || 'Error'; });
      };
      ensureRecaptcha(function(gr){
        if(gr && recaptchaSiteKey){ gr.ready(function(){ gr.execute(recaptchaSiteKey, { action: 'order' }).then(doSubmit); }); }
        else { doSubmit(null); }
      });
    });

    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(err);
    box.appendChild(customerName);
    box.appendChild(customerPhone);
    box.appendChild(clearFloat);
    box.appendChild(list);
    box.appendChild(cartBox);
    box.appendChild(submitBtn);
    container.appendChild(box);

    loadProducts();
  } catch(e){ console.error('Retail widget error', e); }
})();


