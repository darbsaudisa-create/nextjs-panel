// app/(panel)/stores/[storeId]/popups/[widgetId]/leads/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

type Store = {
  id: string;
  name: string;
};

type Widget = {
  id: string;
  name: string | null;
  slug: string | null;
};

type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  page_url: string | null;
  user_agent: string | null;
  created_at: string;
};

export default async function PopupLeadsPage({
  params,
}: {
  params: Promise<{ storeId: string; widgetId: string }>;
}) {
  const { storeId, widgetId } = await params;

  const { data: store } = await supabaseServer
    .from("stores")
    .select("id, name")
    .eq("id", storeId)
    .maybeSingle();

  const { data: widget } = await supabaseServer
    .from("widgets")
    .select("id, name, slug")
    .eq("id", widgetId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!store || !widget) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">بيانات العملاء (Leads)</h1>
        <p className="text-sm text-red-500">
          لم يتم العثور على المتجر أو الـ Popup.
        </p>
        <Link
          href={`/stores/${storeId}/popups`}
          className="mt-4 inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        >
          ← الرجوع إلى قائمة Popups
        </Link>
      </div>
    );
  }

  const { data: leads, error: leadsError } = await supabaseServer
    .from("widget_leads")
    .select(
      "id, name, phone, email, page_url, user_agent, created_at"
    )
    .eq("store_id", storeId)
    .eq("widget_id", widgetId)
    .order("created_at", { ascending: false });

  const list: Lead[] = leads || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            <Link
              href={`/stores/${store.id}/popups`}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 hover:bg-slate-50"
            >
              <span className="text-xs">←</span>
              <span>الرجوع إلى Popups</span>
            </Link>

            <span className="text-slate-400 mx-1">·</span>

            <span>المتجر</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-700">{store.name}</span>
            <span className="text-slate-400">/</span>
            <span>Popups</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-700">
              {widget.slug || widget.id}
            </span>
            <span className="text-slate-400">/</span>
            <span>Leads</span>
          </div>

          <h1 className="text-sm font-semibold">
            بيانات العملاء (Leads) — {widget.name || widget.slug || widget.id}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {leadsError && (
          <p className="mb-3 text-xs text-rose-600">
            تعذر تحميل بيانات الـ Leads، تأكد من الجدول widget_leads.
          </p>
        )}

        {list.length === 0 ? (
          <p className="text-sm text-slate-500">
            لا توجد أي بيانات عملاء لهذا الـ Popup حتى الآن.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-right text-slate-600">
                  <th className="px-3 py-2">الاسم</th>
                  <th className="px-3 py-2">الجوال</th>
                  <th className="px-3 py-2">الإيميل</th>
                  <th className="px-3 py-2">الصفحة</th>
                  <th className="px-3 py-2">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {list.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {lead.name || "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {lead.phone || "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {lead.email || "—"}
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      {lead.page_url ? (
                        <a
                          href={lead.page_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline break-all"
                        >
                          {lead.page_url}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                      {new Date(lead.created_at).toLocaleString("ar-SA", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
