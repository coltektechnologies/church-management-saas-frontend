import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { MemberContribution } from '@/types/memberFinance';

/** jsPDF picks up `lastAutoTable` from jspdf-autotable at runtime */
type JsPDFWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

/** Prefer a readable title when profile data looks like junk tokens instead of a real name. */
export function readableMemberTitle(member: MemberContribution): string {
  const raw = member.name?.trim();
  if (!raw) {
    return `Member (${member.memberId})`;
  }
  const words = raw.split(/\s+/).filter(Boolean);
  if (
    words.length === 2 &&
    raw === raw.toLowerCase() &&
    words[0].length >= 7 &&
    words[0].length <= 11 &&
    words[1].length >= 7 &&
    words[1].length <= 11
  ) {
    return `Member (${member.memberId})`;
  }
  if (/^\d/.test(raw) || /[0-9]{4,}/.test(raw)) {
    return `Member (${member.memberId})`;
  }
  return raw;
}

function sanitizeFilenamePart(name: string): string {
  const base = name
    .replace(/[^\w\s-]/g, '')
    .trim()
    .slice(0, 48);
  return base.replace(/\s+/g, '-') || 'member';
}

function tableEndY(doc: JsPDFWithTable, fallback: number): number {
  const y = doc.lastAutoTable?.finalY;
  return typeof y === 'number' ? y : fallback;
}

const TEAL: [number, number, number] = [11, 130, 106];

/** Full contribution statement as a downloadable PDF. */
export function downloadContributionStatementPdf(member: MemberContribution): void {
  const title = readableMemberTitle(member);
  const dateStr = new Date().toISOString().slice(0, 10);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Contribution statement', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  let lineY = 28;
  const lines = [
    `Generated: ${dateStr}`,
    `Member: ${title}`,
    `Name on record: ${member.name || '—'}`,
    `Member ID: ${member.memberId}`,
    `Phone: ${member.phone}`,
    `Status: ${member.status}`,
    `Member since: ${member.memberSince}`,
  ];
  for (const line of lines) {
    doc.text(line, margin, lineY);
    lineY += 6;
  }

  autoTable(doc, {
    startY: lineY + 4,
    margin: { left: margin, right: margin },
    head: [['Category', 'Amount (GHS)']],
    body: [
      ['Tithe', member.titheYTD.toLocaleString('en-GH')],
      ['Offerings', member.offeringsYTD.toLocaleString('en-GH')],
      ['Projects / other', member.projectsYTD.toLocaleString('en-GH')],
      ['Total', member.totalYTD.toLocaleString('en-GH')],
    ],
    theme: 'striped',
    headStyles: { fillColor: TEAL, fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 2 },
    alternateRowStyles: { fillColor: [245, 250, 248] },
  });

  const docT = doc as JsPDFWithTable;
  let y = tableEndY(docT, lineY + 40) + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Transactions', margin, y);
  y += 8;

  const txRows = member.transactions.map((t) => [
    t.date,
    t.type,
    t.receiptNumber,
    t.amount.toLocaleString('en-GH'),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Date', 'Type', 'Receipt #', 'Amount (GHS)']],
    body: txRows.length ? txRows : [['—', 'No transactions in period', '', '—']],
    theme: 'striped',
    headStyles: { fillColor: TEAL, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    showHead: 'everyPage',
  });

  const footY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Generated from the church treasury portal. For official letterhead PDFs, add a server-side report later.',
    margin,
    footY,
    { maxWidth: pageW - 2 * margin }
  );

  doc.save(`statement-${sanitizeFilenamePart(title)}-${dateStr}.pdf`);
}

/** One-page receipt-style PDF (totals + most recent line). */
export function downloadReceiptPdf(member: MemberContribution): void {
  const title = readableMemberTitle(member);
  const dateStr = new Date().toISOString().slice(0, 10);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const cx = pageW / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Contribution receipt', cx, 28, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 55, 55);
  doc.text(`Date: ${dateStr}`, cx, 38, { align: 'center' });

  let y = 52;
  doc.setFontSize(10);
  doc.text(`Member: ${title}`, margin, y);
  y += 7;
  doc.text(`Name on record: ${member.name || '—'}`, margin, y);
  y += 7;
  doc.text(`Member ID: ${member.memberId}`, margin, y);
  y += 7;
  doc.text(`Phone: ${member.phone}`, margin, y);
  y += 12;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Amount (GHS)']],
    body: [
      ['Tithe', member.titheYTD.toLocaleString('en-GH')],
      ['Offerings', member.offeringsYTD.toLocaleString('en-GH')],
      ['Projects / other', member.projectsYTD.toLocaleString('en-GH')],
      ['Total', member.totalYTD.toLocaleString('en-GH')],
    ],
    theme: 'grid',
    headStyles: { fillColor: TEAL },
    styles: { fontSize: 10 },
  });

  const docT = doc as JsPDFWithTable;
  y = tableEndY(docT, y + 35) + 10;

  if (member.transactions.length) {
    const last = member.transactions[0];
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Latest recorded line:', margin, y);
    y += 5;
    doc.setTextColor(30, 30, 30);
    doc.text(
      `${last.date} · ${last.type} · GHS ${last.amount.toLocaleString('en-GH')} · ${last.receiptNumber}`,
      margin,
      y,
      { maxWidth: pageW - 2 * margin }
    );
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Browser-generated summary. Retain for your records; church letterhead PDFs can be added server-side.',
    margin,
    doc.internal.pageSize.getHeight() - 12,
    { maxWidth: pageW - 2 * margin }
  );

  doc.save(`receipt-${sanitizeFilenamePart(title)}-${dateStr}.pdf`);
}
