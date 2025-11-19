// app/(panel)/stores/[storeId]/filters/page.tsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

type PageProps = {
  params: Promise<{ storeId: string }>;
};

export default async function FiltersPage(props: PageProps) {
  const { storeId } = await props.params;

  const { data: store, error: storeError } = await supabaseServer
    .from("stores")
    .select("id, name")
    .eq("id", storeId)
    .maybeSingle();

  if (storeError || !store) {
    redirect("/");
  }

  const { data: widget } = await supabaseServer
    .from("widgets")
    .select("id, name, status, config")
    .eq("store_id", storeId)
    .eq("kind", "filter_bar")
    .eq("template", "filter_hero_v1")
    .maybeSingle();

  const hero = (widget?.config as any)?.hero || {};
  const placement = (widget?.config as any)?.filterPlacement || {};
  const search = (widget?.config as any)?.search || {};
  const isActive = widget?.status === "active";

  if (!widget) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-gray-300 bg-white p-6">
        <h1 className="text-lg font-semibold">فلاتر البحث — الهيرو الرئيسي</h1>
        <p className="text-sm text-gray-600">
          لا يوجد Widget فلاتر لهذا المتجر حتى الآن.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col gap-1 rounded-xl bg-white/70 p-4 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">
          فلاتر البحث — الهيرو الرئيسي
        </h1>
        <p className="text-sm text-gray-600">
          إعداد الهيرو وشريط الفلاتر الذي يظهر في أعلى متجر سلة.
        </p>
        <p className="text-xs text-gray-500">
          المتجر:&nbsp;
          <span className="font-semibold text-gray-800">{store.name}</span>
        </p>
      </div>

      {/* النموذج */}
      <form
        className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
        action={async (formData: FormData) => {
          "use server";

          const title = formData.get("title")?.toString() || "";
          const subtitle = formData.get("subtitle")?.toString() || "";
          const bg = formData.get("backgroundImageUrl")?.toString() || "";
          const counterTarget = Number(
            formData.get("counterTarget")?.toString() || "0"
          );
          const selector = formData.get("selector")?.toString() || "header";
          const maxParts = Number(formData.get("maxParts")?.toString() || "5");
          const active = formData.get("active") === "on";

          const newConfig = {
            ...(widget.config as any),
            hero: {
              ...(hero || {}),
              title,
              subtitle,
              backgroundImageUrl: bg,
              counterTarget: counterTarget || 0,
            },
            search: {
              ...(search || {}),
              targetDomain: search.targetDomain || "https://darb.com.sa",
              maxParts: maxParts || 5,
            },
            filterPlacement: {
              ...(placement || {}),
              mode: "under_header",
              selector,
            },
          };

          const { error: cfgError } = await supabaseServer
            .from("widgets")
            .update({
              config: newConfig,
              status: active ? "active" : "paused",
            })
            .eq("id", widget.id);

          if (cfgError) {
            console.error("update widget config error", cfgError.message);
          }

          redirect(`/stores/${storeId}/filters`);
        }}
      >
        {/* قسم الهيرو */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">إعدادات الهيرو</h2>
              <p className="text-xs text-gray-500">
                العنوان والنص والخلفية التي تظهر فوق شريط الفلاتر في المتجر.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                عنوان الهيرو
              </label>
              <input
                name="title"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-gray-900"
                defaultValue={hero.title || "ابحث عن قطع غيار سيارتك"}
                placeholder="ابحث عن قطع غيار سيارتك"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                عدد القطع في العداد
              </label>
              <input
                name="counterTarget"
                type="number"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
                defaultValue={hero.counterTarget ?? 180000}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">
              النص تحت العنوان
            </label>
            <textarea
              name="subtitle"
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
              defaultValue={
                hero.subtitle ||
                "ابحث بين 180,000+ قطعة غيار لجميع سيارات تويوتا الأصلية واليابانية والتجارية"
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">
              رابط صورة الخلفية
            </label>
            <input
              name="backgroundImageUrl"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
              defaultValue={
                hero.backgroundImageUrl ||
                "https://via.placeholder.com/1600x500?text=Darb+Hero"
              }
              placeholder="https://..."
            />
            <p className="text-[11px] text-gray-500">
              يُفضّل صورة عريضة (مثلاً 1600×500) بدون نصوص مهمة في الأطراف.
            </p>
          </div>
        </div>

        {/* قسم مكان الظهور + إعدادات البحث */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
            <h2 className="text-sm font-semibold">مكان الظهور في المتجر</h2>
            <p className="text-xs text-gray-500">
              يتم استخدام CSS Selector لتحديد العنصر الذي يظهر تحته الهيرو.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                CSS Selector
              </label>
              <input
                name="selector"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
                defaultValue={placement.selector || "header"}
                placeholder="مثال: header أو #main أو .page-wrapper"
              />
              <p className="text-[11px] text-gray-500">
                الافتراضي: <code className="font-mono">header</code> (أسفل
                الهيدر مباشرة).
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
            <h2 className="text-sm font-semibold">إعدادات الفلاتر</h2>
            <p className="text-xs text-gray-500">
              تتحكم في الحد الأقصى لعدد القطع التي يمكن اختيارها في خانة القطع.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                أقصى عدد للقطع المختارة
              </label>
              <input
                name="maxParts"
                type="number"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
                defaultValue={search.maxParts ?? 5}
              />
              <p className="text-[11px] text-gray-500">
                إذا تركته فارغًا، سيتم استخدام القيمة الافتراضية 5.
              </p>
            </div>
          </div>
        </div>

        {/* تشغيل / إيقاف الويجت */}
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">تفعيل الويجت في المتجر</p>
            <p className="text-xs text-gray-500">
              إذا كان الويجت موقّف لن يظهر في متجر سلة حتى لو سكربت{" "}
              <code className="font-mono">widgets.js</code> مركّب.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={isActive}
              className="h-4 w-4 rounded border-gray-400"
            />
            <span className="text-xs font-semibold">
              {isActive ? "مفعّل" : "موقّف"}
            </span>
          </label>
        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
