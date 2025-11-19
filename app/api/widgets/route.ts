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

  // 1) نجيب المتجر
  const { data: store, error: storeError } = await supabaseServer
    .from("stores")
    .select("id, name, slug, primary_domain, platform, status")
    .eq("id", storeId)
    .maybeSingle();

  if (storeError || !store) {
    return corsJson({ ok: false, error: "STORE_NOT_FOUND" }, 404);
  }

  // 2) لو المتجر مو Active → لا نرجّع شيء
  if (store.status && store.status !== "active") {
    return corsJson(
      {
        ok: true,
        data: {
          store: null,
          widgets: [],
        },
      },
      200
    );
  }

  // 3) نقرأ الدومين اللي طالع منه الطلب (origin أو referer)
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  let requestHost: string | null = null;

  try {
    const source = origin || referer;
    if (source) {
      const parsed = new URL(source);
      requestHost = parsed.hostname.toLowerCase(); // مثال: darb.com.sa
    }
  } catch {
    requestHost = null;
  }

  // 4) نبني قائمة الهوستات المسموح بها لهذا المتجر
  const allowedHosts = new Set<string>();

  if (store.primary_domain) {
    try {
      const raw = String(store.primary_domain).trim();
      const withProto =
        raw.startsWith("http://") || raw.startsWith("https://")
          ? raw
          : `https://${raw}`;
      const host = new URL(withProto).hostname.toLowerCase();
      if (host) {
        allowedHosts.add(host);
      }
    } catch {
      // نتجاهل لو primary_domain خربان
    }
  }

  // 5) هوستات التطوير من env (localhost وغيره)
  const devHosts = (process.env.WIDGETS_DEV_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  // 6) لو فيه requestHost ومو من devHosts ولا من allowedHosts → لا نرجّع ودجت
  if (requestHost && !devHosts.includes(requestHost)) {
    if (!allowedHosts.has(requestHost)) {
      return corsJson(
        {
          ok: true,
          data: {
            store: null,
            widgets: [],
          },
        },
        200
      );
    }
  }

  // 7) جلب الودجتس الفعّالة لهذا المتجر
  const { data: widgets, error: widgetsError } = await supabaseServer
    .from("widgets")
    .select(
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
