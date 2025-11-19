// app/(panel)/stores/[storeId]/widgets/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

type Store = {
  id: string;
  name: string | null;
  primary_domain: string | null;
  slug: string | null;
  platform: string | null;
};

type Widget = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  status: string;
  placement: string | null;
  created_at: string;
};

async function getStore(storeId: string): Promise<Store | null> {
  const { data, error } = await supabaseServer
    .from("stores")
    .select("id, name, primary_domain, slug, platform")
    .eq("id", storeId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as Store | null;
}

async function getStoreWidgets(storeId: string): Promise<Widget[]> {
  const { data, error } = await supabaseServer
    .from("widgets")
    .select("id, name, slug, kind, status, placement, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as Widget[];
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Next.js 16: params هو Promise
export default async function StoreWidgetsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  if (!storeId) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-sm text-red-700">
          معرف المتجر غير موجود في الرابط.
        </div>
        <Link
          href="/stores"
          className="inline-flex text-xs text-slate-900 hover:underline"
        >
          ← الرجوع إلى قائمة المتاجر
        </Link>
      </div>
    );
  }

  const store = await getStore(storeId);
  const widgets = await getStoreWidgets(storeId);

  if (!store) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-sm text-red-700">
          لم يتم العثور على المتجر المطلوب.
        </div>
        <Link
          href="/stores"
          className="inline-flex text-xs text-slate-900 hover:underline"
        >
          ← الرجوع إلى قائمة المتاجر
        </Link>
      </div>
    );
  }

  const storeLabel =
    store.name || store.primary_domain || store.slug || store.id;

  return (
    <div className="p-6 space-y-4">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Widgets للمتجر: {storeLabel}</h1>
          {store.primary_domain ? (
            <a
              href={`https://${store.primary_domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-900 hover:underline"
            >
              زيارة المتجر ({store.primary_domain})
            </a>
          ) : (
            <p className="text-xs text-gray-500">
              لا يوجد دومين أساسي مسجّل لهذا المتجر.
            </p>
          )}
          <p className="text-[11px] text-gray-500">
            هذه الصفحة تعرض الودجت المرتبطة بهذا المتجر (kind + status +
            placement). لاحقًا نضيف أزرار تفعيل/تعطيل وإعدادات لكل Widget.
          </p>
        </div>

        <Link href="/stores" className="text-xs text-slate-900 hover:underline">
          ← الرجوع إلى قائمة المتاجر
        </Link>
      </div>

      {/* قائمة الـ Widgets */}
      {widgets.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-xs text-gray-500">
          لا توجد Widgets مسجّلة لهذا المتجر حتى الآن.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm font-semibold">
              الـ Widgets الخاصة بالمتجر
            </div>
            <div className="text-[11px] text-gray-500">
              عدد الودجت: {widgets.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-gray-500 text-[11px]">
                  <th className="px-3 py-2 text-right font-medium">الاسم</th>
                  <th className="px-3 py-2 text-right font-medium">(slug)</th>
                  <th className="px-3 py-2 text-right font-medium">النوع</th>
                  <th className="px-3 py-2 text-right font-medium">الحالة</th>
                  <th className="px-3 py-2 text-right font-medium">
                    الموضع (placement)
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    تاريخ الإضافة
                  </th>
                </tr>
              </thead>
              <tbody>
                {widgets.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">{w.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{w.slug}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                        {w.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                        {w.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {w.placement || "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDate(w.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
