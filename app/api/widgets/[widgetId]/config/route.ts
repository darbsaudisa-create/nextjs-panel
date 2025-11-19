// app/api/widgets/[widgetId]/config/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await params;

  try {
    const body = await req.json();
    const config = body?.config ?? null;

    if (!widgetId || !config) {
      return NextResponse.json(
        { ok: false, error: "MISSING_DATA" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("widgets")
      .update({ config })
      .eq("id", widgetId);

    if (error) {
      console.error("update widget config error:", error);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update widget config exception:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
