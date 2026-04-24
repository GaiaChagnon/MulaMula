import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/csvParser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "File must be a CSV (text/csv)" }, { status: 400 });
  }

  const text = await file.text();
  const { transactions, errors } = parseCsv(text);

  return NextResponse.json({ transactions, errors });
}
