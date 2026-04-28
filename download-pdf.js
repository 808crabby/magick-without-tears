/* Magick Without Tears 2.0 - PDF export.
   Captures the visible .letter-sheet. The .message animation starts at
   opacity 0; html2canvas re-triggers animations on its clone, which is
   why earlier exports came out blank. The onclone hook below forces
   messages fully visible in the captured DOM. */
(function () {
  if (window.__mwtPdfInjected) return;
  window.__mwtPdfInjected = true;

  var HTML2PDF_CDN =
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';

  function loadHtml2Pdf() {
    return new Promise(function (resolve, reject) {
      if (window.html2pdf) return resolve(window.html2pdf);
      var s = document.createElement('script');
      s.src = HTML2PDF_CDN;
      s.onload = function () { resolve(window.html2pdf); };
      s.onerror = function () { reject(new Error('Could not load PDF library')); };
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

  function onClone(clonedDoc) {
    var style = clonedDoc.createElement('style');
    style.textContent = [
      '.message, .msg-label, .msg-body { animation: none !important; opacity: 1 !important; transform: none !important; }',
      '.typing, .typing-indicator, .error-line { display: none !important; }',
      '#conversation { max-height: none !important; overflow: visible !important; }',
      '.compose-area { display: none !important; }'
    ].join('\n');
    clonedDoc.head.appendChild(style);
  }

  function handleClick() {
    var btn = document.getElementById('downloadPdfBtn');
    if (btn.disabled) return;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing...';

    loadHtml2Pdf()
      .then(function (html2pdf) {
        var target =
          document.querySelector('.letter-sheet') ||
          document.querySelector('.letter-wrap') ||
          document.getElementById('conversation');
        if (!target) throw new Error('No content to capture');

        return html2pdf()
          .from(target)
          .set({
            margin: [0.4, 0.4, 0.4, 0.4],
            filename: filename(),
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ede2c5',
              logging: false,
              onclone: onClone
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
          })
          .save();
      })
      .then(function () {
        btn.textContent = 'Saved';
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1800);
      })
      .catch(function (err) {
        console.error('[Save as PDF]', err);
        btn.textContent = 'Failed';
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2400);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
