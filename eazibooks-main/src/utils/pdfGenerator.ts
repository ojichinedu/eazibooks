import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  company: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    logoUrl?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Colors (monochrome black and white)
  const primaryColor = [0, 0, 0]; // Black
  const secondaryColor = [128, 128, 128]; // Gray
  const lightGray = [240, 240, 240]; // Light gray for backgrounds

  // Header
  doc.setFillColor(...lightGray);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Company Logo (if available)
  if (data.company.logoUrl) {
    try {
      // Add logo - placeholder for now
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(data.company.name, margin, 25);
    } catch (error) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(data.company.name, margin, 25);
    }
  } else {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(data.company.name, margin, 25);
  }

  // Invoice title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('INVOICE', pageWidth - margin, 25, { align: 'right' });

  // Company details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  let yPos = 50;
  
  if (data.company.email) {
    doc.text(data.company.email, margin, yPos);
    yPos += 5;
  }
  if (data.company.phone) {
    doc.text(data.company.phone, margin, yPos);
    yPos += 5;
  }
  if (data.company.address) {
    doc.text(data.company.address, margin, yPos);
    yPos += 5;
  }
  if (data.company.city || data.company.country) {
    doc.text(`${data.company.city || ''}, ${data.company.country || ''}`, margin, yPos);
    yPos += 5;
  }

  // Invoice details (right side)
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  let rightYPos = 50;
  doc.text('Invoice Number:', pageWidth - 80, rightYPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceNumber, pageWidth - margin, rightYPos, { align: 'right' });
  
  rightYPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', pageWidth - 80, rightYPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceDate, pageWidth - margin, rightYPos, { align: 'right' });
  
  if (data.dueDate) {
    rightYPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', pageWidth - 80, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.dueDate, pageWidth - margin, rightYPos, { align: 'right' });
  }

  // Bill To section
  yPos = Math.max(yPos, rightYPos) + 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO:', margin, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.customer.name, margin, yPos);
  
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  
  if (data.customer.email) {
    doc.text(data.customer.email, margin, yPos);
    yPos += 5;
  }
  if (data.customer.phone) {
    doc.text(data.customer.phone, margin, yPos);
    yPos += 5;
  }
  if (data.customer.address) {
    doc.text(data.customer.address, margin, yPos);
    yPos += 5;
  }
  if (data.customer.city || data.customer.country) {
    doc.text(`${data.customer.city || ''}, ${data.customer.country || ''}`, margin, yPos);
    yPos += 5;
  }

  // Items table
  yPos += 10;
  const tableData = data.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, data.currency),
    `${item.tax}%`,
    formatCurrency(item.total, data.currency)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Tax', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: lightGray,
      textColor: primaryColor,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.5,
    },
  });

  // Totals section
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  const totalsX = pageWidth - 70;
  let totalsY = finalY + 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);

  // Subtotal
  doc.text('Subtotal:', totalsX, totalsY);
  doc.text(formatCurrency(data.subtotal, data.currency), pageWidth - margin, totalsY, { align: 'right' });
  
  totalsY += 7;
  doc.text('Tax:', totalsX, totalsY);
  doc.text(formatCurrency(data.taxAmount, data.currency), pageWidth - margin, totalsY, { align: 'right' });
  
  if (data.discountAmount && data.discountAmount > 0) {
    totalsY += 7;
    doc.text('Discount:', totalsX, totalsY);
    doc.text(`-${formatCurrency(data.discountAmount, data.currency)}`, pageWidth - margin, totalsY, { align: 'right' });
  }

  // Draw line
  totalsY += 5;
  doc.setDrawColor(...secondaryColor);
  doc.line(totalsX, totalsY, pageWidth - margin, totalsY);

  // Total
  totalsY += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL:', totalsX, totalsY);
  doc.text(formatCurrency(data.total, data.currency), pageWidth - margin, totalsY, { align: 'right' });

  // Notes
  if (data.notes) {
    totalsY += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, totalsY);
    totalsY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - (2 * margin));
    doc.text(splitNotes, margin, totalsY);
  }

  // Terms and Conditions
  if (data.terms) {
    const termsY = pageHeight - 40;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Terms & Conditions:', margin, termsY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    const splitTerms = doc.splitTextToSize(data.terms, pageWidth - (2 * margin));
    doc.text(splitTerms, margin, termsY + 4);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(
    'Generated by EaziBook - Professional Business Management System',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

export async function downloadInvoicePDF(data: InvoiceData): Promise<void> {
  const blob = await generateInvoicePDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${data.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function previewInvoicePDF(data: InvoiceData): Promise<void> {
  const blob = await generateInvoicePDF(data);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}