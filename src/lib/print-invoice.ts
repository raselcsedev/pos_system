import type { CartItem } from "@/types";

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  invoiceNumber: string;
  date: string;
  cashier: string;
  customer?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: { method: string; amount: number }[];
  footer?: string;
  currencySymbol?: string;
}

export function generateThermalReceiptHTML(data: ReceiptData): string {
  const sym = data.currencySymbol ?? "$";
  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:2px 0">${item.name}<br><small>${item.sku} x${item.quantity}</small></td>
      <td style="text-align:right;padding:2px 0">${fmt(item.price * item.quantity * (1 - item.discount / 100))}</td>
    </tr>`
    )
    .join("");

  const paymentsHtml = data.payments
    .map((p) => `<div>${p.method}: ${fmt(p.amount)}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${data.invoiceNumber}</title>
  <style>
    @media print {
      @page { size: 80mm auto; margin: 2mm; }
      body { width: 72mm; }
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 280px;
      margin: 0 auto;
      padding: 8px;
      color: #000;
      background: #fff;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; }
    hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
    .total { font-size: 14px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:14px">${data.storeName}</div>
  ${data.storeAddress ? `<div class="center">${data.storeAddress}</div>` : ""}
  ${data.storePhone ? `<div class="center">Tel: ${data.storePhone}</div>` : ""}
  <hr>
  <div>Invoice: ${data.invoiceNumber}</div>
  <div>Date: ${data.date}</div>
  <div>Cashier: ${data.cashier}</div>
  ${data.customer ? `<div>Customer: ${data.customer}</div>` : ""}
  <hr>
  <table>${itemsHtml}</table>
  <hr>
  <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${fmt(data.subtotal)}</span></div>
  <div style="display:flex;justify-content:space-between"><span>Discount</span><span>-${fmt(data.discount)}</span></div>
  <div style="display:flex;justify-content:space-between"><span>Tax</span><span>${fmt(data.tax)}</span></div>
  <div class="total" style="display:flex;justify-content:space-between;margin-top:4px"><span>TOTAL</span><span>${fmt(data.total)}</span></div>
  <hr>
  ${paymentsHtml}
  <hr>
  <div class="center">${data.footer ?? "Thank you for your purchase!"}</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
}

export function printThermalReceipt(data: ReceiptData) {
  const html = generateThermalReceiptHTML(data);
  const win = window.open("", "_blank", "width=320,height=600");
  if (!win) {
    alert("Please allow popups for printing");
    return;
  }
  win.document.write(html);
  win.document.close();
}
