import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ReportRow {
  [key: string]: string | number;
}

export function exportToPDF(
  title: string,
  columns: string[],
  rows: ReportRow[],
  filename: string
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  autoTable(doc, {
    head: [columns],
    body: rows.map((row) => columns.map((col) => String(row[col] ?? ""))),
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [5, 150, 105] },
  });

  doc.save(`${filename}.pdf`);
}

export function exportToExcel(
  sheetName: string,
  columns: string[],
  rows: ReportRow[],
  filename: string
) {
  const data = rows.map((row) => {
    const entry: Record<string, string | number> = {};
    columns.forEach((col) => {
      entry[col] = row[col] ?? "";
    });
    return entry;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV(
  columns: string[],
  rows: ReportRow[],
  filename: string
) {
  const header = columns.join(",");
  const body = rows
    .map((row) =>
      columns.map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
