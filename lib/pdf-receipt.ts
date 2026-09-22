// Pure client-side zero-dependency standard PDF-1.4 receipt generator

export interface ReceiptData {
  kode: string;
  tanggal: string;
  nasabah?: string;
  status: string;
  itemTitle?: string;
  itemSubtitle?: string;
  poinText: string;
}

/**
 * Converts a JPEG data URL into a standard PDF-1.4 Blob positioned nicely on an A4 page.
 */
export function createPdfFromImage(jpegDataUrl: string, imgWidth: number, imgHeight: number): Blob {
  const base64Data = jpegDataUrl.split(',')[1];
  const binaryString = atob(base64Data);
  const jpegBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i);
  }

  // Standard A4 dimensions in points (72 DPI: 595.28 x 841.89 pt)
  const a4Width = 595.28;
  const a4Height = 841.89;

  // Fit image centered on A4 page with margins
  const margin = 36;
  const maxW = a4Width - margin * 2;
  const maxH = a4Height - margin * 2;
  const ratio = Math.min(maxW / imgWidth, maxH / imgHeight);
  const renderW = imgWidth * ratio;
  const renderH = imgHeight * ratio;
  const posX = (a4Width - renderW) / 2;
  const posY = (a4Height - renderH) / 2;

  const contentStream = `q\n${renderW.toFixed(2)} 0 0 ${renderH.toFixed(2)} ${posX.toFixed(2)} ${posY.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  const contentStreamBytes = new TextEncoder().encode(contentStream);

  const pdfHeader = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${a4Width} ${a4Height}]\n  /Contents 4 0 R\n  /Resources <<\n    /XObject << /Im1 5 0 R >>\n  >>\n>>\nendobj\n`;
  const obj4Header = `4 0 obj\n<< /Length ${contentStreamBytes.length} >>\nstream\n`;
  const obj4Footer = '\nendstream\nendobj\n';
  const obj5Header = `5 0 obj\n<<\n  /Type /XObject\n  /Subtype /Image\n  /Width ${imgWidth}\n  /Height ${imgHeight}\n  /ColorSpace /DeviceRGB\n  /BitsPerComponent 8\n  /Filter /DCTDecode\n  /Length ${jpegBytes.length}\n>>\nstream\n`;
  const obj5Footer = '\nendstream\nendobj\n';

  const enc = new TextEncoder();
  let offset = enc.encode(pdfHeader).length;
  const offset1 = offset;
  offset += enc.encode(obj1).length;
  const offset2 = offset;
  offset += enc.encode(obj2).length;
  const offset3 = offset;
  offset += enc.encode(obj3).length;
  const offset4 = offset;
  offset += enc.encode(obj4Header).length + contentStreamBytes.length + enc.encode(obj4Footer).length;
  const offset5 = offset;
  offset += enc.encode(obj5Header).length + jpegBytes.length + enc.encode(obj5Footer).length;

  const xrefOffset = offset;
  const pad = (n: number) => String(n).padStart(10, '0');
  const xref = `xref\n0 6\n0000000000 65535 f  \n${pad(offset1)} 00000 n  \n${pad(offset2)} 00000 n  \n${pad(offset3)} 00000 n  \n${pad(offset4)} 00000 n  \n${pad(offset5)} 00000 n  \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new Blob(
    [
      pdfHeader,
      obj1,
      obj2,
      obj3,
      obj4Header,
      contentStreamBytes,
      obj4Footer,
      obj5Header,
      jpegBytes,
      obj5Footer,
      xref,
    ],
    { type: 'application/pdf' }
  );
}

/**
 * Renders a high-resolution receipt on canvas and triggers a native PDF download.
 */
export function downloadReceiptPdf(type: 'penukaran' | 'penyetoran', data: ReceiptData) {
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  const width = 800;
  const height = type === 'penukaran' ? 980 : 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Soft border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Header Icon Container
  ctx.fillStyle = type === 'penukaran' ? '#d97706' : '#006948';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 40, 50, 80, 80, 22);
  ctx.fill();

  // Header Icon Symbol
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type === 'penukaran' ? '🎁' : '♻️', width / 2, 90);

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 28px "Poppins", sans-serif';
  ctx.fillText('BANK SAMPAH DIGITAL', width / 2, 165);

  // Subtitle
  ctx.fillStyle = type === 'penukaran' ? '#b45309' : '#006948';
  ctx.font = 'bold 16px "Poppins", sans-serif';
  ctx.fillText(
    type === 'penukaran' ? 'BUKTI KLAIM PENUKARAN HADIAH' : 'BUKTI RESMI PENYETORAN SAMPAH',
    width / 2,
    195
  );

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 13px "Poppins", sans-serif';
  ctx.fillText(
    type === 'penukaran'
      ? 'Voucher / Penukaran Merchandise & Reward'
      : 'Unit Pengelolaan Sampah Terpadu & Berkelanjutan',
    width / 2,
    220
  );

  // Dashed divider
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(60, 245);
  ctx.lineTo(width - 60, 245);
  ctx.stroke();
  ctx.setLineDash([]);

  // Info Box
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(60, 270, width - 120, 180, 16);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Info details
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Row 1: Kode
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(type === 'penukaran' ? 'KODE TIKET' : 'NO. TRANSAKSI', 90, 312);
  ctx.textAlign = 'right';
  ctx.font = '900 16px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(data.kode, width - 90, 312);

  // Row 2: Tanggal
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(type === 'penukaran' ? 'TANGGAL KLAIM' : 'TANGGAL & WAKTU', 90, 352);
  ctx.textAlign = 'right';
  ctx.font = 'bold 14px "Poppins", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(data.tanggal, width - 90, 352);

  // Row 3: Nasabah
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('NAMA NASABAH', 90, 392);
  ctx.textAlign = 'right';
  ctx.font = 'bold 15px "Poppins", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(data.nasabah || 'Nasabah', width - 90, 392);

  // Row 4: Status
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(type === 'penukaran' ? 'STATUS PENGAMBILAN' : 'STATUS TRANSAKSI', 90, 432);
  ctx.textAlign = 'right';
  ctx.font = 'bold 13px "Poppins", sans-serif';
  ctx.fillStyle = '#006948';
  ctx.fillText('● ' + (data.status ? data.status.toUpperCase() : 'SELESAI'), width - 90, 432);

  let currentY = 485;

  if (type === 'penukaran') {
    // Section header
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Poppins", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('BARANG / VOUCHER YANG DIKLAIM', 60, currentY);

    currentY += 16;

    // Reward Box
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(60, currentY, width - 120, 100, 16);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17px "Poppins", sans-serif';
    ctx.fillText(data.itemTitle || 'Item Hadiah', 90, currentY + 45);

    ctx.fillStyle = '#92400e';
    ctx.font = 'normal 13px "Poppins", sans-serif';
    ctx.fillText('Tunjukkan nota ini pada petugas operasional bank sampah', 90, currentY + 75);

    ctx.textAlign = 'right';
    ctx.font = '900 18px monospace';
    ctx.fillStyle = '#e11d48';
    ctx.fillText(data.poinText, width - 90, currentY + 55);

    currentY += 125;

    // Summary Box
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(60, currentY, width - 120, 70, 16);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 15px "Poppins", sans-serif';
    ctx.fillText('Poin Terpakai:', 90, currentY + 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#e11d48';
    ctx.font = '900 20px monospace';
    ctx.fillText(data.poinText, width - 90, currentY + 43);

    currentY += 105;
  } else {
    // Section header
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Poppins", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RINCIAN PENYETORAN SAMPAH', 60, currentY);

    currentY += 16;

    // Waste Box
    ctx.fillStyle = '#ecfdf5';
    ctx.beginPath();
    ctx.roundRect(60, currentY, width - 120, 110, 16);
    ctx.fill();
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 17px "Poppins", sans-serif';
    ctx.fillText(data.itemTitle || 'Penimbangan Sampah Terpilah', 90, currentY + 45);

    ctx.fillStyle = '#047857';
    ctx.font = 'normal 13px "Poppins", sans-serif';
    ctx.fillText(data.itemSubtitle || 'Terverifikasi staf penimbangan', 90, currentY + 75);

    ctx.textAlign = 'right';
    ctx.font = '900 22px monospace';
    ctx.fillStyle = '#006948';
    ctx.fillText(data.poinText, width - 90, currentY + 60);

    currentY += 140;
  }

  // Footer Note
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 14px "Poppins", sans-serif';
  ctx.fillText(
    type === 'penukaran' ? 'Selamat atas hadiah Anda!' : 'Terima kasih atas kontribusi Anda!',
    width / 2,
    currentY + 20
  );

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 12px "Poppins", sans-serif';
  ctx.fillText(
    type === 'penukaran'
      ? 'Bawa bukti ini ke loket bank sampah untuk verifikasi dan serah terima fisik reward.'
      : 'Dokumen ini adalah bukti transaksi digital resmi yang sah dikeluarkan oleh sistem Bank Sampah.',
    width / 2,
    currentY + 45
  );

  // Digital verification stamp
  ctx.fillStyle = '#006948';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('✓ TERVERIFIKASI SISTEM DIGITAL BANK SAMPAH', width / 2, currentY + 80);

  // Convert canvas to JPEG and create standard PDF Blob
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const pdfBlob = createPdfFromImage(jpegDataUrl, width, height);

  // Trigger PDF file download
  const cleanCode = data.kode.replace(/[^a-zA-Z0-9_-]/g, '');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.download = `${type === 'penukaran' ? 'Bukti-Penukaran' : 'Bukti-Setoran'}-${cleanCode}.pdf`;
  link.href = pdfUrl;
  link.click();
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
}
