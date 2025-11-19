// app/(panel)/stores/[storeId]/popups/[widgetId]/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";
import PopupSaleEditor from "./PopupSaleEditor";
import GrandLaunchEditor from "./GrandLaunchEditor";

type Store = {
  id: string;
  name: string;
  slug: string | null;
};

type Widget = {
  id: string;
  store_id: string;
  name: string | null;
  slug: string | null;
  status: string | null;
  template: string | null;
  config: any;
};

export default async function PopupSettingsPage({
  params,
}: {
  params: Promise<{ storeId: string; widgetId: string }>;
}) {
  const { storeId, widgetId } = await params;

  const { data: store } = await supabaseServer
    .from("stores")
    .select("id, name, slug")
    .eq("id", storeId)
    .maybeSingle();

  const { data: widget, error: widgetError } = await supabaseServer
    .from("widgets")
    .select("id, store_id, name, slug, status, template, config")
    .eq("id", widgetId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!store || widgetError || !widget) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">إعدادات Popup</h1>
        <p className="text-sm text-red-500">
          لم يتم العثور على الـ Popup المطلوب أو حدث خطأ أثناء الجلب.
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

  const rawConfig = widget.config || {};

  const commonBehavior = {
    triggerType: rawConfig.behavior?.triggerType ?? "delay",
    delaySeconds: rawConfig.behavior?.delaySeconds ?? 5,
    perDay: rawConfig.behavior?.perDay ?? 1,
    oncePerVisitor: rawConfig.behavior?.oncePerVisitor ?? false,
  };

  const commonPlacement = {
    mode: rawConfig.placement?.mode ?? "all",
    path: rawConfig.placement?.path ?? "",
  };

  const template = widget.template ?? "sale_popup";

  // ===== إعدادات العرض العادي (Sale Popup) =====
  const saleInitialConfig = {
    heading:
      rawConfig.heading ??
      "🔥 خصم 15% على مشترياتك لفترة محدودة على منتجات مختارة.",
    body:
      rawConfig.body ??
      "خصومات خاصة على منتجات مختارة، مع شحن مجاني لأول 100 عميل.",
    buttonLabel: rawConfig.buttonLabel ?? "احصل على الخصم الآن",
    buttonUrl: rawConfig.buttonUrl ?? "https://example.com",
    buttonColor: rawConfig.buttonColor ?? "#DC2626",
    imageUrl:
      rawConfig.imageUrl ??
      "https://images.pexels.com/photos/7493535/pexels-photo-7493535.jpeg",
    behavior: commonBehavior,
    placement: commonPlacement,
    coupon: {
      enabled: rawConfig.coupon?.enabled ?? false,
      code: rawConfig.coupon?.code ?? "",
    },
    counter: {
      enabled: rawConfig.counter?.enabled ?? false,
      target: rawConfig.counter?.target ?? 0,
      label: rawConfig.counter?.label ?? "",
    },
    headingBlock: {
      enabled: rawConfig.headingBlock?.enabled ?? true,
    },
    bodyBlock: {
      enabled: rawConfig.bodyBlock?.enabled ?? true,
    },
    imageBlock: {
      enabled: rawConfig.imageBlock?.enabled ?? true,
    },
    buttonBlock: {
      enabled: rawConfig.buttonBlock?.enabled ?? true,
    },
    // ستايل القالب (كلاسيكي / فاخر / فخم / جيل زد)
    style: rawConfig.style ?? "classic",
  };

  // ===== إعدادات Popup الافتتاح (Grand Launch) =====
  const launchInitialConfig = {
    badgeText: rawConfig.badgeText ?? "افتتاح ضخم",
    titleText:
      rawConfig.titleText ?? "انتظرونا… سيتم افتتاح المتجر قريبًا",
    subText:
      rawConfig.subText ??
      "نجهّز تجربة تسوّق مختلفة، بأسعار قوية وخدمة أسرع.",
    buttonText: rawConfig.buttonText ?? "نبّهني عند الافتتاح",
    targetCount: rawConfig.targetCount ?? 180000,
    showOncePerDay: rawConfig.showOncePerDay ?? true,
    behavior: commonBehavior,
    placement: commonPlacement,
    form: {
      enabled: rawConfig.form?.enabled ?? true,
      name: {
        enabled: rawConfig.form?.name?.enabled ?? true,
        required: rawConfig.form?.name?.required ?? true,
      },
      phone: {
        enabled: rawConfig.form?.phone?.enabled ?? true,
        required: rawConfig.form?.phone?.required ?? true,
      },
      email: {
        enabled: rawConfig.form?.email?.enabled ?? false,
        required: rawConfig.form?.email?.required ?? false,
      },
      submitLabel: rawConfig.form?.submitLabel ?? "إرسال البيانات",
    },
  };

  return (
    <div className="flex flex-col h-full">
      {/* الهيدر + مسار التصفح + زر Leads */}
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
          </div>

          <h1 className="text-sm font-semibold">
            {template === "grand_launch_popup"
              ? "إعدادات Popup افتتاح ضخم"
              : "إظهار النافذة المنبثقة على موقع الويب الخاص بك"}
          </h1>
        </div>

        {/* زر Leads */}
        <div className="flex items-center gap-2">
          <Link
            href={`/stores/${store.id}/popups/${widget.id}/leads`}
            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
          >
            <span>👥</span>
            <span>بيانات العملاء (Leads)</span>
          </Link>
        </div>
      </div>

      {/* اختيار الـ Editor حسب نوع الـ template */}
      {template === "grand_launch_popup" ? (
        <GrandLaunchEditor
          widget={widget as any}
          initialConfig={launchInitialConfig}
          storeId={store.id}
        />
      ) : (
        <PopupSaleEditor
          widget={widget as any}
          initialConfig={saleInitialConfig}
          storeId={store.id}
        />
      )}
    </div>
  );
}
