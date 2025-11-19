// app/(panel)/stores/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

type Store = {
  id: string;
  name: string;
  slug: string | null;
  primary_domain: string | null;
  platform: string | null;
};

export default async function StoresPage() {
  const { data: stores, error } = await supabaseServer
    .from("stores")
    .select("id, name, slug, primary_domain, platform")
    .order("name");

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">المتاجر المتصلة</h1>
        <p className="text-sm text-red-500">
          تعذر جلب قائمة المتاجر، حاول لاحقًا.
        </p>
      </div>
    );
  }

  const rows: Store[] = (stores as Store[]) ?? [];

  return (
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">المتاجر المتصلة</h1>
        <p className="text-sm text-slate-500">
          هذه القائمة تعرض المتاجر التي فعّلت لوحة Widgets. لاحقًا نضيف خيارات
          أكثر للتحكم والربط.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-right text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">اسم المتجر</th>
              <th className="px-4 py-3 font-medium">(slug)</th>
              <th className="px-4 py-3 font-medium">الدومين الأساسي</th>
              <th className="px-4 py-3 font-medium">المنصة</th>
              <th className="px-4 py-3 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                className="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td className="px-4 py-3 text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.slug}</td>
                <td className="px-4 py-3 text-slate-600">
                  {s.primary_domain || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                    {s.platform || "غير محدد"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/stores/${s.id}/popups`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      إدارة الـ Popups
                    </Link>
                    <Link
                      href={`/stores/${s.id}/filters`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      فلاتر البحث
                    </Link>
                    <Link
                      href={`/stores/${s.id}/widgets`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      جميع Widgets
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  لا توجد متاجر مضافة حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
