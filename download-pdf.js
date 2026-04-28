/* Magick Without Tears 2.0 - PDF export.
   Pure jsPDF text rendering (no html2canvas) so styling oddities can't
   produce a blank page. Output: header with persona name + each message
   prefixed by sender. */
(function () {
  if (window.__mwtPdfInjected) return;
  window.__mwtPdfInjected = true;

  var JSPDF_CDN =
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

  function loadJsPdf() {
    return new Promise(function (resolve, reject) {
      if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
      var s = document.createElement('script');
      s.src = JSPDF_CDN;
      s.onload = function () {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error('jsPDF loaded but global missing'));
      };
      s.onerror = function () { reject(new Error('Could not load jsPDF')); };
      document.head.appendChild(s);
    });
  }

  function slug(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function filename() {
    var t = (document.title || '').split('—')[0].split('-')[0].trim();
    var s = slug(t) || 'correspondence';
    var d = new Date().toISOString().slice(0, 10);
    return s + '-' + d + '.pdf';
  }

  function personaName() {
    var t = (document.title || '').split('—')[0].split('-')[0].trim();
    return t || 'Correspondence';
  }

  function injectButton() {
    var sendBtn = document.getElementById('sendBtn');
    if (!sendBtn || document.getElementById('downloadPdfBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'downloadPdfBtn';
    btn.type = 'button';
    btn.textContent = 'Save as PDF';
    var cs = window.getComputedStyle(sendBtn);
    btn.style.fontFamily = cs.fontFamily;
    btn.style.fontSize = cs.fontSize;
    btn.style.letterSpacing = cs.letterSpacing;
    btn.style.textTransform = cs.textTransform;
    btn.style.padding = cs.padding;
    btn.style.borderRadius = cs.borderRadius;
    btn.style.marginRight = '0.6em';
    btn.style.background = 'transparent';
    btn.style.color = 'var(--gold, #d4a843)';
    btn.style.border = '1px solid rgba(212,168,67,0.4)';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', handleClick);
    sendBtn.parentNode.insertBefore(btn, sendBtn);
  }

  function extractMessages() {
    var conv = document.getElementById('conversation');
    if (!conv) return [];
    var nodes = conv.querySelectorAll('.message');
    var out = [];
    nodes.forEach(function (m) {
      if (m.classList.contains('typing') || m.classList.contains('typing-indicator')) return;
      var labelEl = m.querySelector('.msg-label');
      var bodyEl = m.querySelector('.msg-body') || m;
      var label = labelEl ? labelEl.textContent.trim() : '';
      // If body included the label, strip it.
      var body = bodyEl.innerText.trim();
      if (label && body.indexOf(label) === 0) body = body.slice(label.length).trim();
      if (!body && !label) return;
      out.push({ label: label || 'Message', body: body });
    });
    return out;
  }

  function handleClick() {
    var btn = document.getElementById('downloadPdfBtn');
    if (btn.disabled) return;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing...';

    loadJsPdf()
      .then(function (jsPDF) {
        var msgs = extractMessages();
        if (!msgs.length) throw new Error('No messages to export');

        var doc = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
        var pageW = doc.internal.pageSize.getWidth();
        var pageH = doc.internal.pageSize.getHeight();
        var margin = 0.7;
        var contentW = pageW - margin * 2;
        var y = margin;
        var lh = 0.22; // line height inches

        var newPageIfNeeded = function (need) {
          if (y + need > pageH - margin) {
            doc.addPage();
            y = margin;
          }
        };

        // Title
        doc.setFont('times', 'bold');
        doc.setFontSize(20);
        var title = personaName();
        doc.text(title, pageW / 2, y + 0.25, { align: 'center' });
        y += 0.55;

        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(120);
        var sub = 'Magick Without Tears 2.0 — saved ' +
          new Date().toLocaleString();
        doc.text(sub, pageW / 2, y, { align: 'center' });
        y += 0.45;
        doc.setTextColor(40);

        // Messages
        msgs.forEach(function (m) {
          newPageIfNeeded(0.6);
          doc.setFont('times', 'bold');
          doc.setFontSize(11);
          doc.text(m.label, margin, y);
          y += lh;

          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          var lines = doc.splitTextToSize(m.body, contentW);
          for (var i = 0; i < lines.length; i++) {
            newPageIfNeeded(lh);
            doc.text(lines[i], margin, y);
            y += lh;
          }
          y += 0.18; // gap between messages
        });

        doc.save(filename());
      })
      .then(function () {
        btn.textContent = 'Saved';
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1800);
      })
      .catch(function (err) {
        console.error('[Save as PDF]', err);
        btn.textContent = err.message && err.message.indexOf('No messages') === 0
          ? 'No messages yet'
          : 'Failed';
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2400);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
