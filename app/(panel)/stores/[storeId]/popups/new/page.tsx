// app/(panel)/stores/[storeId]/popups/new/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

// دالة بسيطة لتحويل الاسم إلى slug
function makeSlug(name: string | null | undefined, fallback: string) {
  const base = (name || fallback).trim();
  const s = base
    .replace(/[\u0600-\u06FF]/g, "") // نحذف الحروف العربية
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s) return s;
  return fallback;
}

export default async function NewPopupPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const { data: store } = await supabaseServer
    .from("stores")
    .select("id, name")
    .eq("id", storeId)
    .maybeSingle();

  const baseName = store?.name
    ? `Popup تجريبي لعروض ${store.name}`
    : "Popup تجريبي لعرض المتجر";

  const slug = makeSlug(baseName, `popup-${Date.now()}`);

  const { error: insertError } = await supabaseServer.from("widgets").insert({
    store_id: storeId,
    name: baseName,
    slug, // 👈 مو null
    kind: "popup",
    status: "draft",
    template: "sale_popup",
    placement: "all_pages",
    config: {
      heading: "🔥 خصم 15% على مشترياتك لفترة محدودة على منتجات مختارة.",
      body: "خصومات خاصة على منتجات مختارة، مع شحن مجاني لأول 100 عميل.",
      buttonLabel: "احصل على الخصم الآن",
      buttonUrl: "https://example.com",
      buttonColor: "#DC2626",
      imageUrl:
        "https://images.pexels.com/photos/7493535/pexels-photo-7493535.jpeg",
      behavior: {
        triggerType: "delay",
        delaySeconds: 5,
        perDay: 1,
        oncePerVisitor: false,
      },
      placement: {
        mode: "all",
        path: "",
      },
      coupon: {
        enabled: false,
        code: "",
      },
      counter: {
        enabled: false,
        target: 0,
        label: "",
      },
      headingBlock: { enabled: true },
      bodyBlock: { enabled: true },
      imageBlock: { enabled: true },
      buttonBlock: { enabled: true },
      style: "classic",
    },
  });

  if (!insertError) {
    redirect(`/stores/${storeId}/popups`);
  }

  // لو فيه خطأ نعرضه
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-bold text-red-600">
        خطأ أثناء إنشاء Popup عرض
      </h1>
      <pre className="text-xs bg-slate-900 text-red-200 rounded-md p-3 overflow-x-auto">
        {JSON.stringify(insertError, null, 2)}
      </pre>
      <a
        href={`/stores/${storeId}/popups`}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
      >
        ← الرجوع إلى قائمة Popups
      </a>
    </div>
  );
}
