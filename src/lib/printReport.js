/**
 * Opens a new window with a printable A4 report and triggers the browser's
 * print dialog (the user can "Save as PDF" from there — no server or extra
 * dependency needed to produce Arabic/RTL-correct PDFs).
 */
export function openPrintReport({
  lang = 'ar',
  isRTL = true,
  docTitle,
  heading,
  refLine,
  statusLabel,
  statusColor = '#F2B233',
  generatedLabel,
  printLabel,
  confidentialNote,
  sections = [],
  longSections = [],
}) {
  if (typeof window === 'undefined') return;

  const win = window.open('', '_blank');
  if (!win) return;

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

  const dir = isRTL ? 'rtl' : 'ltr';
  const side = isRTL ? 'left' : 'right';

  const sectionsHtml = sections
    .filter((sec) => sec.fields?.some((f) => f.value !== undefined && f.value !== null && f.value !== ''))
    .map((sec) => `
      <div class="section">
        <h2>${esc(sec.title)}</h2>
        <div class="grid">
          ${sec.fields
            .filter((f) => f.value !== undefined && f.value !== null && f.value !== '')
            .map((f) => `
              <div class="field">
                <span class="label">${esc(f.label)}</span>
                <span class="value"${f.ltr ? ' dir="ltr"' : ''}>${esc(f.value)}</span>
              </div>
            `).join('')}
        </div>
      </div>
    `).join('');

  const longHtml = longSections
    .filter((s) => s.text)
    .map((s) => `
      <div class="section">
        <h2>${esc(s.title)}</h2>
        <p class="longtext">${esc(s.text)}</p>
      </div>
    `).join('');

  const html = `<!doctype html>
<html lang="${esc(lang)}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(docTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Cairo', 'Segoe UI', sans-serif; margin: 0; color: #1a1a1a; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 3px solid #F2B233; padding-bottom: 18px; margin-bottom: 24px; }
  .header img { height: 52px; }
  .header .meta { text-align: ${side}; font-size: 11px; color: #888; }
  h1 { font-size: 21px; margin: 0 0 4px; }
  .badge { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-top: 8px; }
  .refline { font-size: 11px; color: #999; margin-top: 4px; }
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: #b5810f; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; }
  .field { display: flex; flex-direction: column; gap: 2px; }
  .label { font-size: 10px; color: #999; }
  .value { font-size: 13px; font-weight: 600; color: #111; word-break: break-word; }
  .longtext { font-size: 13px; line-height: 1.9; white-space: pre-wrap; color: #333; }
  .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; text-align: center; }
  .toolbar { position: fixed; inset-inline-end: 16px; top: 16px; }
  .toolbar button { font-family: inherit; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 10px; border: none; background: #F2B233; color: #111; cursor: pointer; }
  @media print { .toolbar { display: none; } .page { padding: 0; } @page { margin: 16mm; } }
</style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">${esc(printLabel)}</button></div>
  <div class="page">
    <div class="header">
      <img src="${window.location.origin}/brand/logo-navbar-real.png" alt="logo" />
      <div class="meta">${esc(generatedLabel)}</div>
    </div>
    <h1>${esc(heading)}</h1>
    ${refLine ? `<div class="refline">${esc(refLine)}</div>` : ''}
    ${statusLabel ? `<span class="badge" style="color:${statusColor};background:${statusColor}1a;border:1px solid ${statusColor}55">${esc(statusLabel)}</span>` : ''}
    <div style="height:16px"></div>
    ${sectionsHtml}
    ${longHtml}
    <div class="footer">${esc(confidentialNote || '')}</div>
  </div>
  <script>
    window.onload = function () {
      var go = function () { setTimeout(function () { window.print(); }, 80); };
      if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go).catch(go); }
      else { setTimeout(go, 400); }
    };
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
