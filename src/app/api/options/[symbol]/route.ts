import { NextRequest, NextResponse } from "next/server";
import { getOptionsChain } from "@/lib/adapters/yahoo";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;
  const expiration = request.nextUrl.searchParams.get("expiration") ?? undefined;
  try {
    const chain = await getOptionsChain(symbol, expiration);
    return NextResponse.json(chain);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Options fetch failed" },
      { status: 500 }
    );
  }
}
