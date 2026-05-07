import PDFDocument from 'pdfkit';

interface InvoiceData {
  invoiceId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const COL_W = PAGE_W - MARGIN * 2;

const C = {
  darkGray: '#1a1a1a',
  midGray: '#555555',
  lightGray: '#888888',
  border: '#cccccc',
  bgLight: '#f5f5f5',
  bgDark: '#1a1a1a',
  white: '#ffffff',
};

// ── helpers ────────────────────────────────────────────────────────────────

function hRule(doc: PDFKit.PDFDocument, y: number, x = MARGIN, w = COL_W, thickness = 0.5, color = C.border) {
  doc.save().moveTo(x, y).lineTo(x + w, y).lineWidth(thickness).strokeColor(color).stroke().restore();
}

function filledRect(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, color: string) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

function strokedRect(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, color: string, lw = 0.5) {
  doc.save().rect(x, y, w, h).lineWidth(lw).strokeColor(color).stroke().restore();
}

function sectionLabel(doc: PDFKit.PDFDocument, x: number, y: number, text: string) {
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.lightGray)
    .text(text.toUpperCase(), x, y, { characterSpacing: 0.8 });
}

function tableRow(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number,
  key: string, val: string,
  shaded = false,
) {
  const ROW_H = 26;
  if (shaded) filledRect(doc, x, y, w, ROW_H, C.bgLight);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.midGray)
    .text(key, x + 10, y + 8, { width: 200 });
  doc.fontSize(9).font('Helvetica').fillColor(C.darkGray)
    .text(val, x + 220, y + 8, { width: w - 230 });
  return ROW_H;
}

// ── main ───────────────────────────────────────────────────────────────────

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (e) => reject(e));

      const fmt = (d: string | Date) =>
        new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

      // ── 1. HEADER ────────────────────────────────────────────────────
      filledRect(doc, 0, 0, PAGE_W, 90, C.bgDark);

      // Brand
      doc.fontSize(18).font('Helvetica-Bold').fillColor(C.white)
        .text('Healix', MARGIN, 26);
      doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.4)')
        .text('Your Health, Our Priority', MARGIN, 48);

      // INVOICE label — right aligned, vertically centered in header
      doc.fontSize(22).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.55)')
        .text('INVOICE', MARGIN, 32, { width: COL_W, align: 'right' });

      // thin rule
      doc.save().moveTo(MARGIN, 68).lineTo(PAGE_W - MARGIN, 68)
        .lineWidth(0.4).strokeColor('rgba(255,255,255,0.1)').stroke().restore();

      doc.fontSize(8).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.35)')
        .text('PAYMENT INVOICE', MARGIN, 74, { characterSpacing: 1.2 });

      // ── 2. INVOICE META BANNER ────────────────────────────────────────
      filledRect(doc, 0, 90, PAGE_W, 44, C.bgLight);
      hRule(doc, 134, 0, PAGE_W, 0.5, C.border);

      // Invoice ID — left
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.lightGray)
        .text('INVOICE ID', MARGIN, 100, { characterSpacing: 0.8 });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(data.invoiceId, MARGIN, 112);

      // Payment date — right
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.lightGray)
        .text('PAYMENT DATE', PAGE_W - MARGIN - 130, 100, { width: 130, align: 'right', characterSpacing: 0.8 });
      doc.fontSize(10).font('Helvetica').fillColor(C.darkGray)
        .text(fmt(data.paymentDate), PAGE_W - MARGIN - 130, 112, { width: 130, align: 'right' });

      // ── 3. BODY ───────────────────────────────────────────────────────
      let y = 154;

      // ── 3a. Patient | Doctor (two columns) ───────────────────────────
      const colHalf = (COL_W - 16) / 2;

      // Patient box
      strokedRect(doc, MARGIN, y, colHalf, 72, C.border);
      sectionLabel(doc, MARGIN + 10, y + 10, 'Billed To');
      doc.fontSize(11).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(data.patientName, MARGIN + 10, y + 24, { width: colHalf - 20 });
      doc.fontSize(8.5).font('Helvetica').fillColor(C.midGray)
        .text(data.patientEmail, MARGIN + 10, y + 40, { width: colHalf - 20 });

      // Doctor box
      const dx = MARGIN + colHalf + 16;
      strokedRect(doc, dx, y, colHalf, 72, C.border);
      sectionLabel(doc, dx + 10, y + 10, 'Service Provider');
      doc.fontSize(11).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(`Dr. ${data.doctorName}`, dx + 10, y + 24, { width: colHalf - 20 });
      doc.fontSize(8.5).font('Helvetica').fillColor(C.midGray)
        .text('Healix Services', dx + 10, y + 40, { width: colHalf - 20 });
      doc.fontSize(8.5).font('Helvetica').fillColor(C.midGray)
        .text('support@ph-healthcare.com', dx + 10, y + 54, { width: colHalf - 20 });

      y += 72 + 20;

      // ── 3b. Invoice details table ─────────────────────────────────────
      const detailRows: [string, string][] = [
        ['Invoice ID', data.invoiceId],
        ['Transaction ID', data.transactionId],
        ['Patient Name', data.patientName],
        ['Patient Email', data.patientEmail],
        ['Doctor', `Dr. ${data.doctorName}`],
        ['Appointment Date', fmt(data.appointmentDate)],
        ['Payment Date', fmt(data.paymentDate)],
      ];

      sectionLabel(doc, MARGIN, y, 'Invoice Details');
      y += 14;

      const detailH = detailRows.length * 26;
      strokedRect(doc, MARGIN, y, COL_W, detailH, C.border);

      detailRows.forEach(([k, v], i) => {
        tableRow(doc, MARGIN, y + i * 26, COL_W, k, v, i % 2 === 1);
        if (i < detailRows.length - 1) hRule(doc, y + (i + 1) * 26, MARGIN, COL_W);
      });

      y += detailH + 20;

      // ── 3c. Payment summary table ─────────────────────────────────────
      sectionLabel(doc, MARGIN, y, 'Payment Summary');
      y += 14;

      // Table header row
      filledRect(doc, MARGIN, y, COL_W, 28, C.bgDark);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white)
        .text('Description', MARGIN + 10, y + 9, { width: 260 });
      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white)
        .text('Amount', MARGIN + 10, y + 9, { width: COL_W - 20, align: 'right' });

      y += 28;

      // Line item row
      strokedRect(doc, MARGIN, y, COL_W, 26, C.border);
      doc.fontSize(9).font('Helvetica').fillColor(C.darkGray)
        .text('Consultation Fee', MARGIN + 10, y + 8, { width: 260 });
      doc.fontSize(9).font('Helvetica').fillColor(C.darkGray)
        .text(`₹ ${data.amount.toFixed(2)}`, MARGIN + 10, y + 8, { width: COL_W - 20, align: 'right' });

      y += 26;

      // Total row
      filledRect(doc, MARGIN, y, COL_W, 32, C.bgLight);
      strokedRect(doc, MARGIN, y, COL_W, 32, C.border);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.darkGray)
        .text('Total Amount', MARGIN + 10, y + 11, { width: 260 });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(`₹ ${data.amount.toFixed(2)}`, MARGIN + 10, y + 11, { width: COL_W - 20, align: 'right' });

      y += 32 + 20;

      // ── 3d. Payment status badge ──────────────────────────────────────
      filledRect(doc, MARGIN, y, COL_W, 30, C.bgLight);
      strokedRect(doc, MARGIN, y, COL_W, 30, C.border);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(C.midGray)
        .text('PAYMENT STATUS  ', MARGIN + 10, y + 11, { continued: true })
        .font('Helvetica').fillColor(C.darkGray)
        .text('Paid  ·  Processed securely through Stripe');

      y += 42;

      // ── 3e. Thank you note ────────────────────────────────────────────
      strokedRect(doc, MARGIN, y, COL_W, 30, C.border);
      doc.fontSize(8.5).font('Helvetica').fillColor(C.lightGray)
        .text(
          'Thank you for choosing Healix. This is an electronically generated invoice. For queries contact support@ph-healthcare.com',
          MARGIN + 10, y + 10,
          { width: COL_W - 20, align: 'center' },
        );

      // ── 4. FOOTER ─────────────────────────────────────────────────────
      const footerY = PAGE_H - 52;
      hRule(doc, footerY, 0, PAGE_W);

      doc.fontSize(7.5).font('Helvetica').fillColor(C.lightGray)
        .text(
          'Healix Services  ·  support@ph-healthcare.com  ·  ph-healthcare.com',
          MARGIN, footerY + 14,
          { width: COL_W, align: 'center' },
        );
      doc.fontSize(7.5).font('Helvetica').fillColor(C.lightGray)
        .text(
          'This invoice is system-generated and does not require a signature.',
          MARGIN, footerY + 28,
          { width: COL_W, align: 'center' },
        );
      doc.fontSize(7.5).font('Helvetica').fillColor(C.lightGray)
        .text('Page 1 of 1', PAGE_W - MARGIN - 50, footerY + 14, { width: 50, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
