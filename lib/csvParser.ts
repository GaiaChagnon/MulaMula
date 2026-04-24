import type { Transaction } from "./mockData";

const KNOWN_CATEGORIES = new Set([
  "groceries", "shopping", "entertainment", "eating_out",
  "transport", "bills", "subscriptions", "savings",
]);

function normalizeCategory(raw: string): string {
  const lower = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (KNOWN_CATEGORIES.has(lower)) return lower;
  if (lower.includes("grocer") || lower.includes("supermarket")) return "groceries";
  if (lower.includes("eat") || lower.includes("restaurant") || lower.includes("food")) return "eating_out";
  if (lower.includes("shop") || lower.includes("retail") || lower.includes("cloth")) return "shopping";
  if (lower.includes("entertain") || lower.includes("cinema") || lower.includes("concert")) return "entertainment";
  if (lower.includes("transport") || lower.includes("uber") || lower.includes("bus") || lower.includes("taxi")) return "transport";
  if (lower.includes("bill") || lower.includes("utility") || lower.includes("electric")) return "bills";
  if (lower.includes("sub") || lower.includes("netflix") || lower.includes("spotify")) return "subscriptions";
  return "shopping";
}

function findHeader(headers: string[], candidates: string[]): number {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const c of candidates) {
    const idx = lower.indexOf(c);
    if (idx !== -1) return idx;
  }
  return -1;
}

export type ParseResult = {
  transactions: Transaction[];
  errors: string[];
};

export function parseCsv(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { transactions: [], errors: ["CSV has no data rows."] };

  const headers = lines[0].split(",");
  const dateIdx = findHeader(headers, ["date", "transaction_date", "txn_date"]);
  const merchantIdx = findHeader(headers, ["merchant", "description", "name", "vendor", "payee"]);
  const categoryIdx = findHeader(headers, ["category", "type", "kind"]);
  const amountIdx = findHeader(headers, ["amount", "value", "sum", "debit"]);

  const errors: string[] = [];
  if (dateIdx === -1) errors.push("No 'date' column found.");
  if (amountIdx === -1) errors.push("No 'amount' column found.");
  if (errors.length) return { transactions: [], errors };

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const rawDate = cols[dateIdx]?.trim();
    const rawAmount = cols[amountIdx]?.trim().replace(/[$,]/g, "");
    const merchant = merchantIdx >= 0 ? (cols[merchantIdx]?.trim() || "Unknown") : "Unknown";
    const rawCategory = categoryIdx >= 0 ? cols[categoryIdx]?.trim() : "";

    if (!rawDate || !rawAmount) continue;

    const amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount <= 0) continue;

    const dateMatch = rawDate.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})|(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (!dateMatch) { errors.push(`Row ${i + 1}: invalid date "${rawDate}"`); continue; }

    let isoDate: string;
    if (dateMatch[1]) {
      isoDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
    } else {
      isoDate = `${dateMatch[6]}-${dateMatch[5].padStart(2, "0")}-${dateMatch[4].padStart(2, "0")}`;
    }

    transactions.push({
      date: isoDate,
      merchant,
      category: normalizeCategory(rawCategory || ""),
      amount,
    });
  }

  transactions.sort((a, b) => b.date.localeCompare(a.date));
  return { transactions, errors };
}
