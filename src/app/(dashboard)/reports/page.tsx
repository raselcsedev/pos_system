"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/shared/module-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  type ReportRow,
} from "@/lib/export-reports";

type ReportType = "sales" | "inventory" | "customers" | "profit";

const REPORT_OPTIONS: { type: ReportType; label: string; description: string }[] = [
  { type: "sales", label: "Sales Report", description: "Completed sales with totals" },
  { type: "inventory", label: "Inventory Report", description: "Stock levels and pricing" },
  { type: "customers", label: "Customer Report", description: "Customer balances and loyalty" },
  { type: "profit", label: "Profit & Loss", description: "Revenue vs expenses summary" },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState<ReportType | null>(null);
  const [preview, setPreview] = useState<{ type: ReportType; rows: ReportRow[] } | null>(null);
  const [days, setDays] = useState(30);

  const fetchReport = async (type: ReportType) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/reports?type=${type}&days=${days}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPreview({ type, rows: json.data.rows });
      return json.data.rows as ReportRow[];
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load report");
      return null;
    } finally {
      setLoading(null);
    }
  };

  const getColumns = (rows: ReportRow[]) => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  };

  const handleExport = async (
    type: ReportType,
    format: "pdf" | "excel" | "csv"
  ) => {
    let rows = preview?.type === type ? preview.rows : null;
    if (!rows) rows = await fetchReport(type);
    if (!rows || rows.length === 0) {
      toast.error("No data to export");
      return;
    }

    const columns = getColumns(rows);
    const title = REPORT_OPTIONS.find((r) => r.type === type)!.label;
    const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

    if (format === "pdf") exportToPDF(title, columns, rows, filename);
    else if (format === "excel") exportToExcel(title, columns, rows, filename);
    else exportToCSV(columns, rows, filename);

    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  return (
    <ModulePage title="Reports" description="Sales, inventory, and financial reports with export">
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm text-zinc-500">
          Period (days):
          <select
            className="ml-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_OPTIONS.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <CardTitle className="text-base">{report.label}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading === report.type}
                onClick={() => fetchReport(report.type)}
              >
                {loading === report.type ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(report.type, "pdf")}
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(report.type, "excel")}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(report.type, "csv")}
              >
                CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {preview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Preview: {REPORT_OPTIONS.find((r) => r.type === preview.type)?.label}
            </CardTitle>
            <CardDescription>{preview.rows.length} rows</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  {getColumns(preview.rows).map((col) => (
                    <th key={col} className="pb-2 pr-4 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    {getColumns(preview.rows).map((col) => (
                      <td key={col} className="py-2 pr-4">
                        {String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 20 && (
              <p className="mt-2 text-xs text-zinc-500">
                Showing 20 of {preview.rows.length} rows
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </ModulePage>
  );
}
