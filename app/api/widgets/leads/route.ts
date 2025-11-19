// app/api/widgets/leads/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const widget_id = body.widget_id as string | undefined;
    const store_id = body.store_id as string | undefined;
    const name = (body.name as string | undefined) ?? null;
    const phone = (body.phone as string | undefined) ?? null;
    const email = (body.email as string | undefined) ?? null;
    const page_url = (body.page_url as string | undefined) ?? null;

    if (!widget_id || !store_id) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "MISSING_IDS" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }

    const user_agent = req.headers.get("user-agent") ?? "";

    const { error } = await supabaseServer.from("widget_leads").insert({
      widget_id,
      store_id,
      name,
      phone,
      email,
      page_url,
      user_agent,
    });

    if (error) {
      console.error("widget_leads insert error:", error);
      return new NextResponse(
        JSON.stringify({ ok: false, error: "DB_ERROR" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("widget_leads exception:", err);
    return new NextResponse(
      JSON.stringify({ ok: false, error: "SERVER_ERROR" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}
