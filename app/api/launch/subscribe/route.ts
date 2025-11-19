// app/api/launch/subscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer"; // نستخدم الدالة اللي سويناها

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const widget_id = body.widget_id as string | undefined;
    const phone = (body.phone as string | undefined)?.trim();
    const region = (body.region as string | undefined) ?? null;
    const city = (body.city as string | undefined) ?? null;
    const path =
      (body.path as string | undefined) ?? req.headers.get("referer");

    // تحقق مبدئي
    if (!widget_id || !phone) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const user_agent = req.headers.get("user-agent") ?? "";

    const supabase = createClient();

    const { error } = await supabase.from("launch_reminders").insert({
      widget_id,
      phone,
      region,
      city,
      path,
      user_agent,
    });

    if (error) {
      console.error("launch_reminders insert error:", error);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("launch_reminders exception:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
