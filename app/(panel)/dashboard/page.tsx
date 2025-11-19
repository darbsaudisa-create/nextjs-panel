// app/(panel)/dashboard/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";

type DashboardStats = {
  storesCount: number;
  widgetsCount: number;
  eventsCount: number;
};

type RecentEvent = {
  id: string;
  event_type: string;
  store_id: string | null;
  widget_id: string | null;
  created_at: string;
};

async function getDashboardStats(): Promise<DashboardStats> {
  // عدد المتاجر
  const { count: storesCount } = await supabaseServer
    .from("stores")
    .select("*", { count: "exact", head: true });

  // عدد الودجت الفعّالة
  const { count: widgetsCount } = await supabaseServer
    .from("widgets")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // عدد الأحداث خلال آخر 24 ساعة
  const since = new Date();
  since.setDate(since.getDate() - 1);

  const { count: eventsCount } = await supabaseServer
    .from("widget_events")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since.toISOString());

  return {
    storesCount: storesCount ?? 0,
    widgetsCount: widgetsCount ?? 0,
    eventsCount: eventsCount ?? 0,
  };
}

async function getRecentEvents(): Promise<RecentEvent[]> {
  const { data, error } = await supabaseServer
    .from("widget_events")
    .select("id, event_type, store_id, widget_id, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // لو صار خطأ، نرجّع مصفوفة فاضية بدون ما نطبع شيء
  if (error) {
    // تقدر تخليه console.warn لو حاب، بس Next ما يطلع Overlay على warn
    // console.warn("dashboard recent events warning:", error);
    return [];
  }

  return (data ?? []) as RecentEvent[];
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  // تنسيق بسيط بالتاريخ والوقت
  return d.toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const [stats, recentEvents] = await Promise.all([
    getDashboardStats(),
    getRecentEvents(),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* العنوان والوصف */}
      <div className="space-y-1 text-center md:text-right">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-xs md:text-sm text-gray-600">
          ملخص سريع عن المتاجر المتصلة، والـ Widgets الفعّالة، والأحداث (events)
          التي يرسلها كود الودجت من متاجرك على سلة وغيرها.
        </p>
      </div>

      {/* الكروت الثلاثة */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              عدد المتاجر المتصلة
            </div>
            <div className="text-3xl font-bold">
              {stats.storesCount.toLocaleString("ar-SA")}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-gray-500">
            المتاجر التي فعّلت كود Widgets وتم تسجيلها في قاعدة البيانات.
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              عدد الـ Widgets الفعّالة
            </div>
            <div className="text-3xl font-bold">
              {stats.widgetsCount.toLocaleString("ar-SA")}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-gray-500">
            الودجت التي حالتها مفعّلة ويمكن أن يستهلكها كود JS في المتاجر.
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              الأحداث خلال آخر ٢٤ ساعة
            </div>
            <div className="text-3xl font-bold">
              {stats.eventsCount.toLocaleString("ar-SA")}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-gray-500">
            مجموع المشاهدات/النقرات أو أي Events سجّلها كود الويدجت خلال اليوم
            الماضي.
          </div>
        </div>
      </div>

      {/* جدول آخر الأحداث */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">آخر الأحداث المسجّلة</div>
            <div className="text-[11px] text-gray-500">
              آخر ١٠ Events من جدول <code>widget_events</code>.
            </div>
          </div>
        </div>

        {recentEvents.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-500">
            لا توجد أحداث مسجّلة حتى الآن. جرّب تركيب كود الودجت في أحد المتاجر،
            ثم راقب هنا النشاط.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-gray-500 text-[11px]">
                  <th className="px-3 py-2 text-right font-medium">الوقت</th>
                  <th className="px-3 py-2 text-right font-medium">
                    نوع الحدث
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    المتجر (store_id)
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    الودجت (widget_id)
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDate(ev.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                        {ev.event_type || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-gray-700">
                        {ev.store_id || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-gray-700">
                        {ev.widget_id || "-"}
                      </span>
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
