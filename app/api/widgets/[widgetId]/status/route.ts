// app/api/widgets/[widgetId]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const status = body.status as string | undefined;

  if (!status || (status !== "active" && status !== "paused" && status !== "draft")) {
    return NextResponse.json(
      { ok: false, error: "invalid status" },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("widgets")
    .update({ status })
    .eq("id", widgetId);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
