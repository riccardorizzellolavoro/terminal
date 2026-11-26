import { NextRequest, NextResponse } from "next/server";
import {
  getChunksForSymbol,
  runCitationLockedAnalyst,
} from "@/lib/adapters/ai-analyst";
import { LangCode } from "@/lib/types";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "AAPL";
  const chunks = getChunksForSymbol(symbol);
  return NextResponse.json({ symbol: symbol.toUpperCase(), chunks });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      symbol?: string;
      question?: string;
      lang?: LangCode;
      provider?: "local" | "openai" | "anthropic" | "ollama";
      apiKey?: string;
      baseUrl?: string;
      model?: string;
      valuationSummary?: string;
    };

    if (!body.symbol || !body.question) {
      return NextResponse.json(
        { error: "symbol and question are required" },
        { status: 400 }
      );
    }

    const result = await runCitationLockedAnalyst({
      symbol: body.symbol,
      question: body.question,
      lang: body.lang,
      provider: body.provider,
      apiKey: body.apiKey,
      baseUrl: body.baseUrl,
      model: body.model,
      valuationSummary: body.valuationSummary,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analyst query failed" },
      { status: 500 }
    );
  }
}
