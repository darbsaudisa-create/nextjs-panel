// app/(panel)/stores/[storeId]/popups/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";
import PopupActions from "./PopupActions";
import PopupToolbar from "./PopupToolbar";

type Store = {
  id: string;
  name: string;
  slug: string | null;
  primary_domain: string | null;
};

type Widget = {
  id: string;
  name: string | null;
  slug: string | null;
  kind: string | null;
  status: string | null;
  placement: string | null;
  created_at: string | null;
  config: any | null;
};

type WidgetStats = {
  views: number;
  clicks: number;
};

export default async function StorePopupsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const { data: store, error: storeError } = await supabaseServer
    .from("stores")
    .select("id, name, slug, primary_domain")
    .eq("id", storeId)
    .maybeSingle();

  if (storeError || !store) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">
          النوافذ المنبثقة (Popups)
        </h1>
        <p className="text-sm text-red-500">
          المتجر غير موجود أو حدث خطأ أثناء الجلب.
        </p>
      </div>
    );
  }

  // Widgets من نوع popup
  const { data: widgets, error: widgetsError } = await supabaseServer
    .from("widgets")
    .select("id, name, slug, kind, status, placement, created_at, config")
    .eq("store_id", storeId)
    .eq("kind", "popup")
    .order("created_at", { ascending: false });

  const popupWidgets: Widget[] = (widgets as Widget[]) ?? [];

  // إحصائيات من widget_events (نعدّها في TypeScript)
  const statsMap: Record<string, WidgetStats> = {};
  if (popupWidgets.length > 0) {
    const ids = popupWidgets.map((w) => w.id);

    const { data: eventsRows } = await supabaseServer
      .from("widget_events")
      .select("widget_id, event_type")
      .in("widget_id", ids as string[]);

    if (eventsRows) {
      for (const row of eventsRows as any[]) {
        const wid = row.widget_id as string;
        const type = row.event_type as string;

        if (!statsMap[wid]) {
          statsMap[wid] = { views: 0, clicks: 0 };
        }
        if (type === "view") statsMap[wid].views += 1;
        if (type === "click") statsMap[wid].clicks += 1;
      }
    }
  }

  function getPlacementLabel(w: Widget): string {
    const cfg = w.config || {};
    const placementCfg = cfg.placement || {};

    if (placementCfg.mode === "path") {
      const path = placementCfg.path || "";
      if (path) return `صفحة محددة: ${path}`;
      return "صفحة محددة";
    }
    if (placementCfg.mode === "all") {
      return "جميع الصفحات";
    }

    if (w.placement === "all_pages" || !w.placement) return "جميع الصفحات";
    return w.placement;
  }

  return (
    <div className="p-6 space-y-6">
      {/* الهيدر */}
      <header className="flex flex-col gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/stores"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <span className="text-base leading-none">←</span>
              <span>الرجوع إلى قائمة المتاجر</span>
            </Link>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1">
              <span className="text-slate-400">/</span>
              <span className="font-medium text-slate-700">{store.name}</span>
              <span className="text-slate-400">/</span>
              <span>Popups</span>
              {store.primary_domain && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-[11px] text-slate-500">
                    {store.primary_domain}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>حالة النظام: مستقر</span>
            </span>
            <button className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50">
              توثيق الـ API
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            النوافذ المنبثقة{" "}
            <span className="text-sm font-normal text-slate-500">(Popups)</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            استخدم الـ Popups لعرض التنبيهات، والعروض، وجمع أرقام الواتساب أو
            البريد الإلكتروني. كل عنصر في القائمة أدناه يمثل خدمة Popup جاهزة
            بتصميم ووظيفة مختلفة (افتتاح، شريط، اشتراك إيميل، إلخ).
          </p>
        </div>
      </header>

      {/* شريط الأدوات (زرين إضافة) */}
      <PopupToolbar
        storeId={store.id}
        popupCount={popupWidgets.length}
      />

      {/* المحتوى */}
      <section>
        {widgetsError ? (
          <p className="text-sm text-red-500">
            تعذر جلب النوافذ المنبثقة لهذا المتجر.
          </p>
        ) : popupWidgets.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-2xl p-10 text-center text-sm text-slate-500 bg-slate-50/40">
            لا توجد نوافذ منبثقة مضافة لهذا المتجر حتى الآن.
            <br />
            ابدأ بإنشاء أول Popup من أحد الأزرار بالأعلى.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {popupWidgets.map((w) => {
              const isActive = w.status === "active";
              const stats = statsMap[w.id] || { views: 0, clicks: 0 };
              const ctr =
                stats.views > 0
                  ? ((stats.clicks / stats.views) * 100).toFixed(1)
                  : "0.0";

              const placementLabel = getPlacementLabel(w);

              return (
                <article
                  key={w.id}
                  className={
                    "flex flex-col justify-between rounded-2xl border p-4 transition-shadow " +
                    (isActive
                      ? "border-indigo-100 bg-indigo-50/60 shadow-sm"
                      : "border-slate-200 bg-white shadow-sm hover:shadow-md")
                  }
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-lg">
                      <span>📢</span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-bold">
                            {w.name || "Popup بدون اسم"}
                          </h2>
                          <p className="text-[11px] text-slate-500">
                            {w.slug || "بدون slug مخصّص"}
                          </p>
                        </div>

                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                            (isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-50 text-slate-600 border border-slate-100")
                          }
                        >
                          {isActive ? "مفعّل" : "غير مفعّل"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        نافذة منبثقة جاهزة لعرض تنبيه أو عرض أو نموذج اشتراك.
                        يمكن تخصيص النصوص والألوان من إعدادات الـ Popup.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 border border-slate-100">
                          <span className="text-slate-400">النوع:</span>
                          <span className="font-medium">Popup</span>
                        </span>
                        <span className="inline-flex items_center gap-1 rounded-full bg-slate-50 px-2 py-0.5 border border-slate-100">
                          <span className="text-slate-400">الموضع:</span>
                          <span className="font-medium">{placementLabel}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span>
                          مشاهدات:{" "}
                          <span className="font-semibold">{stats.views}</span>
                        </span>
                        <span>
                          نقرات:{" "}
                          <span className="font-semibold">{stats.clicks}</span>
                        </span>
                        <span>
                          نسبة النقر:{" "}
                          <span className="font-semibold">{ctr}%</span>
                        </span>
                      </div>

                      {w.created_at && (
                        <span className="text-[10px] text-slate-400">
                          أضيفت في{" "}
                          {new Date(w.created_at).toLocaleDateString("ar-SA")}
                        </span>
                      )}
                    </div>

                    <PopupActions
                      storeId={store.id}
                      widgetId={w.id}
                      isActive={isActive}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
