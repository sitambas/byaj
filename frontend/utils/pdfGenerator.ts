import jsPDF from 'jspdf';

interface LoanData {
  billNumber: string;
  principalAmount: number;
  interestRate: number;
  interest: number;
  processFee: number;
  total: number;
  recovered: number;
  outstanding: number;
  startDate: string;
  endDate: string | null;
  loanType: string;
  status: string;
}

interface CustomerData {
  name: string;
  phone: string;
  address?: string;
  accountNo?: string;
  book?: {
    name: string;
  };
}

interface TotalsData {
  totalPrincipal: number;
  totalInterest: number;
  totalProcessFee: number;
  totalAmount: number;
  totalRecovered: number;
  totalOutstanding: number;
}

export const generateCustomerLoanReportPDF = (
  customer: CustomerData,
  loans: LoanData[],
  totals: TotalsData
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Colors
  const primaryColor = [79, 70, 229]; // Indigo-600
  const secondaryColor = [220, 38, 38]; // Red-600
  const lightGray = [243, 244, 246];
  const darkGray = [55, 65, 81];
  const textGray = [107, 114, 128];

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Draw header with logo area
  const drawHeader = () => {
    // Header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Draw logo using shapes (representing the KripAnidhi logo)
    const logoX = margin;
    const logoY = 12;
    const logoSize = 18;
    
    // Outer circle (indigo)
    doc.setFillColor(...primaryColor);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'FD');
    
    // Inner shapes (representing the logo design)
    doc.setFillColor(255, 255, 255);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 3, 'F');
    
    // Center element (red)
    doc.setFillColor(...secondaryColor);
    doc.ellipse(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 6, logoSize / 3, 'F');

    // Company name and details
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('KripAnidhi', margin + 30, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Marketing Service', margin + 30, 28);
    // doc.text('हर घर की जरूरत', margin + 30, 34);

    // Report title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Loan Report', pageWidth - margin, 20, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth - margin, 28, { align: 'right' });

    // Decorative line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    yPos = 65;
  };

  // Draw customer information section
  const drawCustomerInfo = () => {
    // Section title
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', margin + 5, yPos + 6);

    yPos += 15;

    // Customer details box
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 2, 2, 'S');

    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', margin + 5, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name || 'N/A', margin + 25, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', margin + 5, yPos + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.phone || 'N/A', margin + 25, yPos + 15);

    if (customer.address) {
      doc.setFont('helvetica', 'bold');
      doc.text('Address:', margin + 5, yPos + 22);
      doc.setFont('helvetica', 'normal');
      const addressLines = doc.splitTextToSize(customer.address, pageWidth - 2 * margin - 30);
      doc.text(addressLines, margin + 25, yPos + 22);
    }

    if (customer.accountNo) {
      doc.setFont('helvetica', 'bold');
      doc.text('Account No:', margin + 5, yPos + 29);
      doc.setFont('helvetica', 'normal');
      doc.text(customer.accountNo, margin + 25, yPos + 29);
    }

    if (customer.book?.name) {
      doc.setFont('helvetica', 'bold');
      doc.text('Branch:', pageWidth / 2, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(customer.book.name, pageWidth / 2 + 20, yPos + 8);
    }

    yPos += 45;
  };

  // Draw loans table
  const drawLoansTable = () => {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }

    // Section title
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Accounts', margin + 5, yPos + 6);

    yPos += 15;

    // Table header
    const tableTop = yPos;
    const colWidths = [
      (pageWidth - 2 * margin) * 0.12, // Bill Number
      (pageWidth - 2 * margin) * 0.15, // Principal
      (pageWidth - 2 * margin) * 0.12, // Interest
      (pageWidth - 2 * margin) * 0.12, // Process Fee
      (pageWidth - 2 * margin) * 0.15, // Total
      (pageWidth - 2 * margin) * 0.15, // Recovered
      (pageWidth - 2 * margin) * 0.19, // Outstanding
    ];

    let xPos = margin;
    const headerHeight = 10;
    
    // Header background
    doc.setFillColor(...primaryColor);
    doc.rect(xPos, yPos, pageWidth - 2 * margin, headerHeight, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['Bill No.', 'Principal', 'Interest', 'Process Fee', 'Total', 'Recovered', 'Outstanding'];
    headers.forEach((header, index) => {
      doc.text(header, xPos + colWidths[index] / 2, yPos + 7, { align: 'center' });
      xPos += colWidths[index];
    });

    yPos += headerHeight;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    loans.forEach((loan, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
        // Redraw header on new page
        xPos = margin;
        doc.setFillColor(...primaryColor);
        doc.rect(xPos, yPos, pageWidth - 2 * margin, headerHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, idx) => {
          doc.text(header, xPos + colWidths[idx] / 2, yPos + 7, { align: 'center' });
          xPos += colWidths[idx];
        });
        yPos += headerHeight;
      }

      // Row background (alternating)
      if (index % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }

      // Row border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      // Row data
      xPos = margin;
      doc.setTextColor(...darkGray);
      
      const rowData = [
        loan.billNumber || 'N/A',
        formatCurrency(loan.principalAmount),
        formatCurrency(loan.interest),
        formatCurrency(loan.processFee),
        formatCurrency(loan.total),
        formatCurrency(loan.recovered),
        formatCurrency(loan.outstanding),
      ];

      rowData.forEach((data, idx) => {
        doc.text(data, xPos + colWidths[idx] / 2, yPos + 6, { align: 'center' });
        xPos += colWidths[idx];
      });

      yPos += 8;
    });

    // Table bottom border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
  };

  // Draw totals section
  const drawTotals = () => {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    // Totals box
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 50, 2, 2, 'F');
    
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 50, 2, 2, 'S');

    yPos += 8;

    doc.setTextColor(...darkGray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin + 5, yPos);

    yPos += 10;

    const totalsData = [
      { label: 'Total Principal:', value: formatCurrency(totals.totalPrincipal) },
      { label: 'Total Interest:', value: formatCurrency(totals.totalInterest) },
      { label: 'Total Process Fee:', value: formatCurrency(totals.totalProcessFee) },
      { label: 'Total Amount:', value: formatCurrency(totals.totalAmount) },
      { label: 'Total Recovered:', value: formatCurrency(totals.totalRecovered) },
      { label: 'Total Outstanding:', value: formatCurrency(totals.totalOutstanding) },
    ];

    doc.setFontSize(9);
    totalsData.forEach((item, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textGray);
      doc.text(item.label, margin + 10, yPos);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkGray);
      doc.text(item.value, pageWidth - margin - 10, yPos, { align: 'right' });
      
      yPos += 6;
    });

    // Highlight outstanding amount
    yPos += 2;
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text('Outstanding Amount', margin + 10, yPos);
    doc.text(formatCurrency(totals.totalOutstanding), pageWidth - margin - 10, yPos, { align: 'right' });
  };

  // Draw footer
  const drawFooter = () => {
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated report.', pageWidth / 2, footerY, { align: 'center' });
  };

  // Generate PDF
  drawHeader();
  drawCustomerInfo();
  drawLoansTable();
  drawTotals();
  
  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter();
  }

  return doc;
};

