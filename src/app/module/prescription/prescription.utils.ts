import PDFDocument from 'pdfkit';
import { envVars } from '../../config/env';
import { PrescriptionData } from './prescription.interface';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const COL_W = PAGE_W - MARGIN * 2;

const C = {
  black: '#000000',
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
    .text(key, x + 10, y + 8, { width: 160 });
  doc.fontSize(9).font('Helvetica').fillColor(C.darkGray)
    .text(val, x + 175, y + 8, { width: w - 185 });
  return ROW_H;
}

// ── main ───────────────────────────────────────────────────────────────────

export const generatePrescriptionPDF = async (
  prescriptionData: PrescriptionData,
): Promise<Buffer> => {
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

      // Rx watermark
      doc.fontSize(36).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.08)')
        .text('Rx', PAGE_W - MARGIN - 52, 18, { width: 52, align: 'right' });

      // thin rule inside header
      doc.save().moveTo(MARGIN, 68).lineTo(PAGE_W - MARGIN, 68)
        .lineWidth(0.4).strokeColor('rgba(255,255,255,0.1)').stroke().restore();

      doc.fontSize(8).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.35)')
        .text('MEDICAL PRESCRIPTION', MARGIN, 74, { characterSpacing: 1.2 });

      // ── 2. PATIENT BANNER ─────────────────────────────────────────────
      filledRect(doc, 0, 90, PAGE_W, 44, C.bgLight);
      hRule(doc, 134, 0, PAGE_W, 0.5, C.border);

      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.lightGray)
        .text('PATIENT', MARGIN, 100, { characterSpacing: 0.8 });
      doc.fontSize(14).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(prescriptionData.patientName, MARGIN, 112);

      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.lightGray)
        .text('DATE ISSUED', PAGE_W - MARGIN - 120, 100, { width: 120, align: 'right', characterSpacing: 0.8 });
      doc.fontSize(10).font('Helvetica').fillColor(C.darkGray)
        .text(fmt(prescriptionData.createdAt), PAGE_W - MARGIN - 120, 112, { width: 120, align: 'right' });

      // ── 3. BODY ───────────────────────────────────────────────────────
      let y = 154;

      // ── 3a. Doctor | Prescription ref (two columns) ───────────────────
      const colHalf = (COL_W - 16) / 2;

      // Doctor box
      strokedRect(doc, MARGIN, y, colHalf, 72, C.border);
      sectionLabel(doc, MARGIN + 10, y + 10, 'Attending Physician');
      doc.fontSize(11).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(`Dr. ${prescriptionData.doctorName}`, MARGIN + 10, y + 24);
      doc.fontSize(8.5).font('Helvetica').fillColor(C.midGray)
        .text(prescriptionData.doctorEmail, MARGIN + 10, y + 40, { width: colHalf - 20 });

      // Prescription ref box
      const rx = MARGIN + colHalf + 16;
      strokedRect(doc, rx, y, colHalf, 72, C.border);
      sectionLabel(doc, rx + 10, y + 10, 'Prescription Reference');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.darkGray)
        .text(String(prescriptionData.prescriptionId), rx + 10, y + 26, { width: colHalf - 20 });
      sectionLabel(doc, rx + 10, y + 46, 'Appointment Date');
      doc.fontSize(9).font('Helvetica').fillColor(C.darkGray)
        .text(fmt(prescriptionData.appointmentDate), rx + 10, y + 58, { width: colHalf - 20 });

      y += 72 + 20;

      // ── 3b. Prescription details table ───────────────────────────────
      const detailRows: [string, string][] = [
        ['Prescription ID', String(prescriptionData.prescriptionId)],
        ['Patient Name', prescriptionData.patientName],
        ['Patient Email', prescriptionData.patientEmail],
        ['Appointment Date', fmt(prescriptionData.appointmentDate)],
        ['Date Issued', fmt(prescriptionData.createdAt)],
      ];
      if (prescriptionData.followUpDate) {
        detailRows.push(['Follow-up Date', fmt(prescriptionData.followUpDate)]);
      }

      sectionLabel(doc, MARGIN, y, 'Prescription Details');
      y += 14;

      const tableH = detailRows.length * 26;
      strokedRect(doc, MARGIN, y, COL_W, tableH, C.border);

      detailRows.forEach(([k, v], i) => {
        tableRow(doc, MARGIN, y + i * 26, COL_W, k, v, i % 2 === 1);
        if (i < detailRows.length - 1) hRule(doc, y + (i + 1) * 26, MARGIN, COL_W);
      });

      y += tableH + 20;

      // ── 3c. Follow-up notice ──────────────────────────────────────────
      if (prescriptionData.followUpDate) {
        filledRect(doc, MARGIN, y, COL_W, 30, C.bgLight);
        strokedRect(doc, MARGIN, y, COL_W, 30, C.border);
        filledRect(doc, MARGIN, y, 3, 30, C.darkGray);
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.midGray)
          .text('FOLLOW-UP APPOINTMENT   ', MARGIN + 14, y + 11, { continued: true })
          .font('Helvetica').fillColor(C.darkGray)
          .text(fmt(prescriptionData.followUpDate));
        y += 42;
      }

      // ── 3d. Instructions ──────────────────────────────────────────────
      sectionLabel(doc, MARGIN, y, 'Instructions & Medications');
      y += 14;

      const instrH =
        doc.fontSize(9.5).font('Helvetica')
          .heightOfString(prescriptionData.instructions, { width: COL_W - 28, lineGap: 3 }) + 28;

      strokedRect(doc, MARGIN, y, COL_W, instrH, C.border);
      filledRect(doc, MARGIN, y, 3, instrH, C.darkGray);   // left accent

      doc.fontSize(9.5).font('Helvetica').fillColor(C.darkGray)
        .text(prescriptionData.instructions, MARGIN + 16, y + 14, {
          width: COL_W - 28,
          lineGap: 3,
          align: 'left',
        });

      y += instrH + 24;

      // ── 3e. Notice strip ──────────────────────────────────────────────
      filledRect(doc, MARGIN, y, COL_W, 30, C.bgLight);
      strokedRect(doc, MARGIN, y, COL_W, 30, C.border);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(C.midGray)
        .text('NOTICE  ', MARGIN + 10, y + 11, { continued: true })
        .font('Helvetica').fillColor(C.lightGray)
        .text('Follow all instructions carefully. Contact your doctor if you experience any adverse effects.');

      // ── 4. FOOTER ─────────────────────────────────────────────────────
      const footerY = PAGE_H - 52;
      hRule(doc, footerY, 0, PAGE_W);

      doc.fontSize(7.5).font('Helvetica').fillColor(C.lightGray)
        .text(
          'This is an electronically generated prescription from Healix Services. Do not share with unauthorized persons.',
          MARGIN, footerY + 12,
          { width: COL_W, align: 'center' },
        );
      doc.fontSize(7.5).font('Helvetica').fillColor(C.lightGray)
        .text(
          `For more information visit: ${envVars.FRONTEND_URL}`,
          MARGIN, footerY + 26,
          { width: COL_W, align: 'center' },
        );
      doc.fontSize(7.5).font('Helvetica').fillColor(C.lightGray)
        .text('Page 1 of 1', PAGE_W - MARGIN - 50, footerY + 12, { width: 50, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
