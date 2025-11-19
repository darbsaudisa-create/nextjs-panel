// app/api/widgets/events/route.ts

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
    const event_type = body.event_type as string | undefined;

    if (!widget_id || !event_type) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "MISSING_FIELDS" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }

    const session_id = (body.session_id as string | undefined) ?? null;
    const visitor_id = (body.visitor_id as string | undefined) ?? null;
    const page_url = (body.page_url as string | undefined) ?? null;
    const meta = body.meta ?? {};

    const user_agent = req.headers.get("user-agent") ?? "";

    const { error } = await supabaseServer.from("widget_events").insert({
      widget_id,
      event_type,
      session_id,
      visitor_id,
      page_url,
      user_agent,
      meta,
    });

    if (error) {
      console.error("widget_events insert error:", error);
      return new NextResponse(
        JSON.stringify({ ok: false, error: "DB_ERROR" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    console.error("widget_events exception:", err);
    return new NextResponse(
      JSON.stringify({ ok: false, error: "SERVER_ERROR" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      }
    );
  }
}
