import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF type for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

// Color palette matching the app theme
const COLORS = {
  bg: [10, 10, 15] as [number, number, number],
  cardBg: [18, 18, 26] as [number, number, number],
  accent: [200, 255, 0] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  muted: [160, 160, 180] as [number, number, number],
  red: [255, 107, 107] as [number, number, number],
  green: [0, 229, 160] as [number, number, number],
  border: [40, 40, 55] as [number, number, number],
};

const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  Food: [255, 107, 107],
  Transport: [200, 255, 0],
  Shopping: [123, 97, 255],
  Bills: [255, 184, 0],
  Entertainment: [0, 229, 160],
  Health: [75, 159, 255],
  EMI: [255, 80, 80],
  Education: [123, 97, 255],
};

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
) {
  doc.setFillColor(...fill);
  if (stroke) {
    doc.setDrawColor(...stroke);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
}

export async function exportExpensePdf(
  transactions: any[],
  monthLabel: string,
  allExpensesForChart?: any[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  }) as jsPDFWithAutoTable;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  // ============ FULL PAGE DARK BACKGROUND ============
  const drawPageBg = () => {
    doc.setFillColor(...COLORS.bg);
    doc.rect(0, 0, pageW, pageH, "F");
  };
  drawPageBg();

  // Override addPage to automatically draw the dark background
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function (...args: any[]) {
    originalAddPage(...args);
    drawPageBg();
    return this;
  };

  // ============ HEADER ============
  let y = margin;

  // Header bar
  drawRoundedRect(doc, margin, y, contentW, 28, 4, COLORS.cardBg, COLORS.border);

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.accent);
  doc.text("Finsight AI", margin + 8, y + 12);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text("Expense Tracker", margin + 8, y + 19);

  // Report title on right
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Report", pageW - margin - 8, y + 12, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.accent);
  doc.text(monthLabel, pageW - margin - 8, y + 19, { align: "right" });

  y += 35;

  // ============ SUMMARY CARDS ============
  const totalExpense = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const avgExpense = transactions.length > 0 ? totalExpense / transactions.length : 0;
  const maxExpense = transactions.length > 0 ? Math.max(...transactions.map((t) => t.amount || 0)) : 0;
  const uniqueCategories = new Set(transactions.map((t) => t.category?.name)).size;

  const cardData = [
    { label: "Total Expenses", value: `Rs. ${totalExpense.toLocaleString("en-IN")}`, color: COLORS.red },
    { label: "Transactions", value: transactions.length.toString(), color: COLORS.accent },
    { label: "Average Spend", value: `Rs. ${Math.round(avgExpense).toLocaleString("en-IN")}`, color: COLORS.green },
    { label: "Highest Spend", value: `Rs. ${maxExpense.toLocaleString("en-IN")}`, color: [255, 184, 0] as [number, number, number] },
  ];

  const cardW = (contentW - 9) / 4;
  const cardH = 26;

  cardData.forEach((card, i) => {
    const cx = margin + i * (cardW + 3);
    drawRoundedRect(doc, cx, y, cardW, cardH, 3, COLORS.cardBg, COLORS.border);

    // Color accent line on top
    doc.setFillColor(...card.color);
    doc.roundedRect(cx + 4, y + 3, 18, 2.5, 1, 1, "F");

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, cx + 4, y + 11);

    doc.setFontSize(14);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, cx + 4, y + 20);
  });

  y += cardH + 8;

  // ============ CATEGORY BREAKDOWN ============
  const categoryMap: Record<string, number> = {};
  transactions.forEach((t) => {
    const cat = t.category?.name || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + (t.amount || 0);
  });
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    // Section card
    const chartH = 60;
    drawRoundedRect(doc, margin, y, contentW, chartH + 14, 4, COLORS.cardBg, COLORS.border);

    doc.setFontSize(12);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text("Category Breakdown", margin + 8, y + 10);

    const barAreaX = margin + 8;
    const barAreaY = y + 16;
    const barAreaW = contentW - 16;
    const barAreaH = chartH - 8;
    const maxVal = sortedCategories[0][1];
    const barCount = Math.min(sortedCategories.length, 8);
    const barH = Math.min((barAreaH - (barCount - 1) * 2.5) / barCount, 7);

    sortedCategories.slice(0, 8).forEach(([cat, val], i) => {
      const by = barAreaY + i * (barH + 2.5);
      const barW = (val / maxVal) * (barAreaW - 65);
      const color = CATEGORY_COLORS[cat] || [150, 150, 180];

      // Category label
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.setFont("helvetica", "normal");
      doc.text(cat, barAreaX, by + barH / 2 + 1.5);

      // Background bar
      doc.setFillColor(30, 30, 45);
      doc.roundedRect(barAreaX + 30, by, barAreaW - 65, barH, 1.5, 1.5, "F");

      // Value bar
      doc.setFillColor(...(color as [number, number, number]));
      if (barW > 2) {
        doc.roundedRect(barAreaX + 30, by, barW, barH, 1.5, 1.5, "F");
      }

      // Amount label
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.white);
      doc.setFont("helvetica", "bold");
      doc.text(`Rs. ${val.toLocaleString("en-IN")}`, barAreaX + barAreaW - 14, by + barH / 2 + 1.5, { align: "right" });

      // Percentage
      const pct = Math.round((val / totalExpense) * 100);
      doc.setFontSize(6);
      doc.setTextColor(...COLORS.muted);
      doc.text(`${pct}%`, barAreaX + barAreaW - 2, by + barH / 2 + 1.5, { align: "right" });
    });

    y += chartH + 20;
  }



  // ============ CHECK IF TABLE NEEDS NEW PAGE ============
  if (y + 40 > pageH - 20) {
    doc.addPage();
    drawPageBg();
    y = margin;
  }

  // ============ TRANSACTION TABLE ============
  drawRoundedRect(doc, margin, y, contentW, 12, 4, COLORS.cardBg, COLORS.border);
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Details", margin + 8, y + 8);
  y += 14;

  const tableData = transactions.map((t, i) => [
    (i + 1).toString(),
    new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    t.description || "-",
    t.category?.name || "Other",
    t.merchant || "-",
    `Rs. ${(t.amount || 0).toLocaleString("en-IN")}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Date", "Description", "Category", "Merchant", "Amount"]],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [220, 220, 230],
      fillColor: COLORS.bg,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      font: "helvetica",
    },
    headStyles: {
      fillColor: [25, 25, 40],
      textColor: COLORS.accent,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [14, 14, 22],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 32, halign: "right", textColor: [255, 107, 107], fontStyle: "bold" },
    },
  });

  // ============ TOTAL ROW ============
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || y + 20;

  drawRoundedRect(doc, margin, finalY + 2, contentW, 12, 3, [25, 25, 40], COLORS.border);
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total", margin + 8, finalY + 10);
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(12);
  doc.text(`Rs. ${totalExpense.toLocaleString("en-IN")}`, pageW - margin - 8, finalY + 10, { align: "right" });

  // ============ FOOTER ON ALL PAGES ============
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated by Finsight AI • ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      margin,
      pageH - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 7, { align: "right" });
  }

  // ============ SAVE ============
  const fileName = `Finsight_Expense_Report_${monthLabel.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
