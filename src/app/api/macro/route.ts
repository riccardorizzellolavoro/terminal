import { NextResponse } from "next/server";
import { loadMarketSummary } from "@/lib/services/ticker-service";

export async function GET() {
  try {
    const data = await loadMarketSummary();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Macro fetch failed" },
      { status: 500 }
    );
  }
}
