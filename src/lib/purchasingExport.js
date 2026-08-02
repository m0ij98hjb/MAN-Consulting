function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(filename, rows) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export async function exportExcel(filename, rows) {
  if (!rows?.length) return;
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportWord(filename, htmlContent) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>${htmlContent}</body></html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  downloadBlob(blob, `${filename}.doc`);
}

export function exportPDF() {
  window.print();
}

export async function exportAttachmentsZip(filename, attachments) {
  if (!attachments?.length) return;
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  await Promise.all(attachments.map(async (a, i) => {
    const res = await fetch(a.url);
    const blob = await res.blob();
    zip.file(a.name || `file-${i}`, blob);
  }));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${filename}.zip`);
}
