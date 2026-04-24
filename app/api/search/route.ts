import { NextResponse } from "next/server";
import { braveSearch } from "@/lib/searchTool";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Search not configured" }, { status: 503 });
  }

  try {
    const results = await braveSearch(q.trim(), apiKey);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
