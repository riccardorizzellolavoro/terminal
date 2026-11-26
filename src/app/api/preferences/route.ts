import { NextRequest, NextResponse } from "next/server";
import { getAllPreferences, setPreference } from "@/lib/db";

export async function GET() {
  try {
    const prefs = getAllPreferences();
    return NextResponse.json({ preferences: prefs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Preferences read failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      key?: string;
      value?: unknown;
    };
    if (!body.key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }
    const serialized =
      typeof body.value === "string"
        ? body.value
        : JSON.stringify(body.value ?? "");
    setPreference(body.key, serialized);
    return NextResponse.json({ ok: true, key: body.key });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Preference save failed" },
      { status: 500 }
    );
  }
}
