// app/api/widgets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(body: any, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const storeId = url.searchParams.get("store_id");

  if (!storeId) {
    return corsJson({ ok: false, error: "MISSING_STORE_ID" }, 400);
  }

  const { data: store, error: storeError } = await supabaseServer
    .from("stores")
    .select("id, name, slug, primary_domain, platform, status")
    .eq("id", storeId)
    .maybeSingle();

  if (storeError || !store) {
    return corsJson({ ok: false, error: "STORE_NOT_FOUND" }, 404);
  }

  const { data: widgets, error: widgetsError } = await supabaseServer
    .from("widgets")
    .select(
      // 👇 نفس حقلك القديم + template فقط
      "id, store_id, name, slug, kind, status, placement, template, config, starts_at, ends_at"
    )
    .eq("store_id", storeId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (widgetsError) {
    return corsJson({ ok: false, error: "WIDGETS_ERROR" }, 500);
  }

  return corsJson({
    ok: true,
    data: {
      store,
      widgets: widgets || [],
    },
  });
}
