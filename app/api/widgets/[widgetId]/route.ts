// app/api/widgets/[widgetId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ widgetId: string }> }
) {
  // هنا نفك الـ Promise زي ما يقول Next.js
  const { widgetId } = await ctx.params;

  if (!widgetId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_WIDGET_ID" },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("widgets")
    .delete()
    .eq("id", widgetId);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
