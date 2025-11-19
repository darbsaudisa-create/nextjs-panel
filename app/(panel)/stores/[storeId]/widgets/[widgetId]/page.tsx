// app/(panel)/stores/[storeId]/widgets/[widgetId]/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

type Store = {
  id: string;
  name: string | null;
  primary_domain: string | null;
};

type Widget = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  kind: string;
  template: string;
  status: string;
  config: any;
};

async function getStore(storeId: string): Promise<Store | null> {
  const { data, error } = await supabaseServer
    .from("stores")
    .select("id, name, primary_domain")
    .eq("id", storeId)
    .maybeSingle();

  if (error) return null;
  return data as Store | null;
}

async function getWidget(
  storeId: string,
  widgetId: string
): Promise<Widget | null> {
  const { data, error } = await supabaseServer
    .from("widgets")
    .select("id, store_id, name, slug, kind, template, status, config")
    .eq("store_id", storeId)
    .eq("id", widgetId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Widget;
}

// ====== Server Action ======
export async function updateAdvancedCarPicker(formData: FormData) {
  "use server";

  const storeId = formData.get("storeId") as string | null;
  const widgetId = formData.get("widgetId") as string | null;

  if (!storeId || !widgetId) return;

  const label = (formData.get("label") as string) || "اختيار السيارة";
  const side = (formData.get("side") as string) || "left";
  const bottom = Number(formData.get("bottom") || 90);

  const projectId =
    (formData.get("projectId") as string) || "spare-parts-project-55319";
  const apiKey = (formData.get("apiKey") as string) || "";
  const metaDoc = (formData.get("metaDoc") as string) || "SECTION_OPTIONS";

  const maxParts = Number(formData.get("maxParts") || 5);
  const targetDomain =
    (formData.get("targetDomain") as string) || "https://darb.com.sa";

  const status = formData.get("status") === "on" ? "active" : "paused";

  const newConfig = {
    label,
    position: {
      side: side === "right" ? "right" : "left",
      bottom: Number.isFinite(bottom) ? bottom : 90,
    },
    firestore: {
      projectId,
      apiKey,
      metaDoc,
    },
    search: {
      maxParts: Number.isFinite(maxParts) && maxParts > 0 ? maxParts : 5,
      targetDomain,
    },
  };

  await supabaseServer
    .from("widgets")
    .update({
      config: newConfig,
      status,
    })
    .eq("id", widgetId)
    .eq("store_id", storeId);

  revalidatePath(`/stores/${storeId}/widgets`);
  redirect(`/stores/${storeId}/widgets`);
}

// Next.js 16: params هو Promise
export default async function AdvancedCarPickerPage({
  params,
}: {
  params: Promise<{ storeId: string; widgetId: string }>;
}) {
  const { storeId, widgetId } = await params;

  const store = await getStore(storeId);
  const widget = await getWidget(storeId, widgetId);

  if (!store || !widget) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-red-600">
          لم يتم العثور على المتجر أو الـ Widget المطلوب.
        </p>
        <Link
          href={`/stores/${storeId}/widgets`}
          className="text-xs text-slate-900 hover:underline"
        >
          ← الرجوع إلى جميع Widgets
        </Link>
      </div>
    );
  }

  if (
    widget.kind !== "filter_bar" ||
    widget.template !== "car_picker_button_v1"
  ) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-red-600">
          هذا الـ Widget ليس من نوع "بحث متقدم - اختيار السيارة".
        </p>
        <Link
          href={`/stores/${storeId}/widgets`}
          className="text-xs text-slate-900 hover:underline"
        >
          ← الرجوع إلى جميع Widgets
        </Link>
      </div>
    );
  }

  const cfg = widget.config || {};
  const position = cfg.position || {};
  const firestore = cfg.firestore || {};
  const search = cfg.search || {};

  const label = cfg.label ?? "اختيار السيارة";
  const side = position.side ?? "left";
  const bottom = position.bottom ?? 90;
  const projectId = firestore.projectId ?? "spare-parts-project-55319";
  const apiKey = firestore.apiKey ?? "";
  const metaDoc = firestore.metaDoc ?? "SECTION_OPTIONS";
  const maxParts = search.maxParts ?? 5;
  const targetDomain = search.targetDomain ?? "https://darb.com.sa";
  const isActive = widget.status === "active";

  const storeLabel = store.name || store.primary_domain || store.id;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">
            بحث متقدم — اختيار السيارة ({storeLabel})
          </h1>
          <p className="text-[11px] text-slate-500">
            ضبط إعدادات زر اختيار السيارة (الموضع، النص، بيانات Firestore،
            الدومين، وعدد القطع المسموح بها).
          </p>
        </div>
        <Link
          href={`/stores/${storeId}/widgets`}
          className="text-xs text-slate-900 hover:underline"
        >
          ← الرجوع إلى جميع Widgets
        </Link>
      </div>

      <form
        action={updateAdvancedCarPicker}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <input type="hidden" name="storeId" value={storeId} />
        <input type="hidden" name="widgetId" value={widget.id} />

        {/* الحالة */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-sm font-semibold">حالة الـ Widget</div>
            <p className="text-[11px] text-slate-500">
              إذا كانت مفعّلة (active) يظهر زر اختيار السيارة في المتجر.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="status"
              defaultChecked={isActive}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span>{isActive ? "مفعّل" : "موقّف"}</span>
          </label>
        </div>

        {/* إعدادات الزر */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">إعدادات الزر</div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">نص الزر (label)</label>
              <input
                name="label"
                defaultValue={label}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">الجانب (side)</label>
              <select
                name="side"
                defaultValue={side === "right" ? "right" : "left"}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              >
                <option value="left">يسار</option>
                <option value="right">يمين</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">
                المسافة من الأسفل (px)
              </label>
              <input
                type="number"
                name="bottom"
                defaultValue={bottom}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Firestore */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">إعدادات Firestore</div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">projectId</label>
              <input
                name="projectId"
                defaultValue={projectId}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs ltr:text-left rtl:text-right"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium">apiKey</label>
              <input
                name="apiKey"
                defaultValue={apiKey}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs ltr:text-left rtl:text-right"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">metaDoc</label>
              <input
                name="metaDoc"
                defaultValue={metaDoc}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* بحث / رابط الانتقال */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">إعدادات البحث والانتقال</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">
                أقصى عدد للقطع المختارة (maxParts)
              </label>
              <input
                type="number"
                name="maxParts"
                min={1}
                defaultValue={maxParts}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">
                الدومين المستهدف (targetDomain)
              </label>
              <input
                name="targetDomain"
                defaultValue={targetDomain}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs ltr:text-left rtl:text-right"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                مثال: https://darb.com.sa (بدون / في النهاية).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            href={`/stores/${storeId}/widgets`}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            حفظ التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}
