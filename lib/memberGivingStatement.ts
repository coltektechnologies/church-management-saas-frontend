import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { MemberGivingSummary, MemberPledge } from '@/lib/api';

type JsPDFWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

const TEAL: [number, number, number] = [11, 130, 106];

function tableEndY(doc: JsPDFWithTable, fallback: number): number {
  const y = doc.lastAutoTable?.finalY;
  return typeof y === 'number' ? y : fallback;
}

function sanitizeFilenamePart(name: string): string {
  const base = name
    .replace(/[^\w\s-]/g, '')
    .trim()
    .slice(0, 48);
  return base.replace(/\s+/g, '-') || 'member';
}

/**
 * Download a PDF giving statement from portal summary data (recorded treasury income only).
 */
export function downloadMemberGivingStatementPdf(params: {
  summary: MemberGivingSummary;
  memberName: string;
  pledges?: MemberPledge[];
}): void {
  const { summary, memberName, pledges = [] } = params;
  const dateStr = new Date().toISOString().slice(0, 10);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Giving statement', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  let lineY = 28;
  const headerLines = [
    `Generated: ${dateStr}`,
    `Member: ${memberName || 'Member'}`,
    'Source: Recorded income linked to your member profile (treasury).',
  ];
  for (const line of headerLines) {
    doc.text(line, margin, lineY);
    lineY += 6;
  }

  autoTable(doc, {
    startY: lineY + 4,
    margin: { left: margin, right: margin },
    head: [['Category', 'Amount (GHS)']],
    body: [
      ['Tithes (YTD)', summary.ytd_tithe],
      ['Offerings (YTD)', summary.ytd_offering],
      ['Other (YTD)', summary.ytd_other],
      ['Total (YTD)', summary.ytd_total],
    ],
    theme: 'striped',
    headStyles: { fillColor: TEAL, fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 2 },
    alternateRowStyles: { fillColor: [245, 250, 248] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 62 } },
  });

  const docT = doc as JsPDFWithTable;
  let y = tableEndY(docT, lineY + 50) + 10;

  if (pledges.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Pledges', margin, y);
    y += 8;
    const pledgeRows = pledges.map((p) => [
      String(p.pledge_year),
      p.title?.trim() || '—',
      p.target_amount,
      p.amount_fulfilled,
      p.status,
    ]);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Year', 'Title', 'Target', 'Paid', 'Status']],
      body: pledgeRows,
      theme: 'striped',
      headStyles: { fillColor: TEAL, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 1.5 },
    });
    y = tableEndY(doc as JsPDFWithTable, y + 30) + 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Transactions', margin, y);
  y += 8;

  const txRows = summary.history.map((h) => [
    h.transaction_date,
    h.receipt_number,
    h.category_name || '—',
    h.payment_method,
    h.amount,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Date', 'Receipt #', 'Type', 'Method', 'Amount (GHS)']],
    body: txRows.length ? txRows : [['—', '—', 'No recorded transactions yet', '', '—']],
    theme: 'striped',
    headStyles: { fillColor: TEAL, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 1.5 },
    showHead: 'everyPage',
  });

  const footY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Unofficial summary from the member portal. For stamped statements or corrections, contact your church treasurer.',
    margin,
    footY,
    { maxWidth: pageW - 2 * margin }
  );

  doc.save(`giving-statement-${sanitizeFilenamePart(memberName || 'member')}-${dateStr}.pdf`);
}
