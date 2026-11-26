import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type?: "webinar" | "keynote" | "trial" | "signin";
      email?: string;
      name?: string;
      plan?: "monthly" | "annual";
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date();

    if (body.type === "trial" || body.type === "signin") {
      const trialEnds = new Date(now.getTime() + 7 * 86_400_000).toISOString();
      db.prepare(
        `INSERT INTO user_trials (email, plan, status, trial_ends_at, created_at)
         VALUES (?, ?, 'trial_active', ?, ?)
         ON CONFLICT(email) DO UPDATE SET plan = excluded.plan`
      ).run(email, body.plan || "annual", trialEnds, now.toISOString());

      return NextResponse.json({
        ok: true,
        status: "trial_active",
        trialEndsAt: trialEnds,
        email,
      });
    }

    db.prepare(
      `INSERT INTO webinar_registrations (email, name, event_type, created_at)
       VALUES (?, ?, ?, ?)`
    ).run(email, body.name?.trim() || "Guest Investor", body.type || "keynote", now.toISOString());

    return NextResponse.json({
      ok: true,
      eventType: body.type || "keynote",
      email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
