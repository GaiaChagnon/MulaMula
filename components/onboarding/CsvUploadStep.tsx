"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseCsv } from "@/lib/csvParser";
import type { Transaction } from "@/lib/mockData";

interface CsvUploadStepProps {
  onComplete: (transactions: Transaction[] | null) => void;
}

export function CsvUploadStep({ onComplete }: CsvUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrors(["Please upload a .csv file."]);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") return;
      const result = parseCsv(text);
      setTransactions(result.transactions);
      setErrors(result.errors);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const previewRows = transactions?.slice(0, 5) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#0f172a] tracking-tight">
          Import your transactions
        </h2>
        <p className="mt-1 text-sm text-[#64748b]">
          Upload a CSV export from your bank. We&apos;ll detect dates, merchants, and amounts automatically.
        </p>
      </div>

      {/* Drop zone */}
      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? "#06b6d4" : "#e0f2fe",
          backgroundColor: isDragging ? "#ecfeff" : "#f0f9ff",
        }}
        transition={{ duration: 0.15 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-3 rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-6 py-10 cursor-pointer transition-colors"
        style={{ borderStyle: "dashed", borderWidth: "1.5px" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={handleFileChange}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-[#e0f2fe]">
          <svg className="h-6 w-6 text-[#06b6d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#0f172a]">
            {fileName ? (
              <span className="text-[#06b6d4]">{fileName}</span>
            ) : (
              <>Drop your CSV here, or <span className="text-[#06b6d4]">browse</span></>
            )}
          </p>
          <p className="mt-0.5 text-xs text-[#64748b]">Supports exports from most major banks</p>
        </div>
      </motion.div>

      {/* Parse errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-700 mb-1">Parse issues</p>
              <ul className="space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-600">{err}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview table */}
      <AnimatePresence>
        {previewRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mb-2 text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Preview — first {previewRows.length} rows
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#e0f2fe]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#f0f9ff] text-left">
                    {["Date", "Merchant", "Category", "Amount"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0f2fe] bg-white">
                  {previewRows.map((txn, i) => (
                    <tr key={i} className="hover:bg-[#f0f9ff] transition-colors">
                      <td className="px-4 py-2.5 text-[#64748b] whitespace-nowrap">{txn.date}</td>
                      <td className="px-4 py-2.5 text-[#0f172a] font-medium whitespace-nowrap">{txn.merchant}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block rounded-full bg-[#ecfeff] px-2.5 py-0.5 text-xs font-medium text-[#06b6d4] capitalize">
                          {txn.category.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#0f172a] font-semibold tabular-nums">
                        ${txn.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions && transactions.length > 5 && (
              <p className="mt-1.5 text-xs text-[#64748b]">
                +{transactions.length - 5} more transactions detected
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          onClick={() => onComplete(null)}
          className="order-2 sm:order-1 rounded-lg border border-[#e0f2fe] bg-white px-5 py-2.5 text-sm font-medium text-[#64748b] transition-colors hover:border-[#06b6d4] hover:text-[#06b6d4]"
        >
          Skip, use demo data
        </button>
        {transactions && transactions.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onComplete(transactions)}
            className="order-1 sm:order-2 rounded-lg bg-[#06b6d4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0891b2] active:bg-[#0e7490]"
          >
            Use this data
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
