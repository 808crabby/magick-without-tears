/* Magick Without Tears 2.0 — conversation PDF export
   Loaded once per page; injects a "Save as PDF" button next to #sendBtn,
   lazy-loads html2pdf.js on demand, captures the rendered #conversation
   (plus letterhead) and triggers a download. */
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
    btn.title = 'Download this correspondence as a PDF';

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
    btn.style.opacity = '0.85';
    btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '0.85'; });
    btn.addEventListener('click', handleClick);

    sendBtn.parentNode.insertBefore(btn, sendBtn);
  }

  function buildPrintable() {
    var conv = document.getElementById('conversation');
    if (!conv) throw new Error('No conversation on this page');

    var bg = '#ede2c5';
    try {
      var sheet = document.querySelector('.letter-sheet');
      if (sheet) bg = window.getComputedStyle(sheet).backgroundColor || bg;
    } catch (e) {}

    var wrap = document.createElement('div');
    wrap.style.background = bg;
    wrap.style.padding = '2.4rem 2.6rem';
    wrap.style.color = '#3a2f1c';
    wrap.style.maxWidth = '7.5in';
    wrap.style.margin = '0 auto';

    var head = document.querySelector('.letterhead');
    if (head) {
      var headClone = head.cloneNode(true);
      headClone.style.marginBottom = '1.2rem';
      wrap.appendChild(headClone);
    }

    var convClone = conv.cloneNode(true);
    // Strip duplicate #conversation id so CSS rules still target the original.
    convClone.removeAttribute('id');
    convClone.querySelectorAll('.typing, .typing-indicator, .error-line').forEach(function (n) {
      var p = n.closest('.message') || n;
      if (p && p.parentNode) p.parentNode.removeChild(p);
    });
    convClone.style.maxHeight = 'none';
    convClone.style.overflow = 'visible';
    wrap.appendChild(convClone);

    return wrap;
  }

  function handleClick() {
    var btn = document.getElementById('downloadPdfBtn');
    if (btn.disabled) return;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing…';

    loadHtml2Pdf()
      .then(function (html2pdf) {
        var node = buildPrintable();
        // html2canvas misrenders position:fixed offscreen elements as blank.
        // Use absolute + translate, which keeps layout correct and is captured.
        node.style.position = 'absolute';
        node.style.top = '0';
        node.style.left = '0';
        node.style.width = '7.5in';
        node.style.transform = 'translate(-99999px, 0)';
        node.style.zIndex = '0';
        document.body.appendChild(node);

        var cleanup = function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        };
        return html2pdf()
          .from(node)
          .set({
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: filename(),
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
          })
          .save()
          .then(function () { cleanup(); }, function (err) { cleanup(); throw err; });
      })
      .then(function () {
        btn.textContent = '✓ Saved';
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1800);
      })
      .catch(funct
