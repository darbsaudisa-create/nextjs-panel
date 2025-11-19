// app/(panel)/stores/[storeId]/popups/new-launch/page.tsx

import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

function makeSlug(name: string | null | undefined, fallback: string) {
  const base = (name || fallback).trim();
  const s = base
    .replace(/[\u0600-\u06FF]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s) return s;
  return fallback;
}

export default async function NewLaunchPopupPage({
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
    ? `Popup افتتاح — ${store.name}`
    : "Popup افتتاح المتجر";

  const slug = makeSlug(baseName, `grand-launch-${Date.now()}`);

  const { error: insertError } = await supabaseServer.from("widgets").insert({
    store_id: storeId,
    name: baseName,
    slug, // 👈 مو null
    kind: "popup",
    status: "draft",
    template: "grand_launch_popup",
    placement: "all_pages",
    config: {
      badgeText: "افتتاح ضخم",
      titleText: "انتظرونا… سيتم افتتاح المتجر قريبًا",
      subText: "نجهّز تجربة تسوّق مختلفة، بأسعار قوية وخدمة أسرع.",
      buttonText: "نبّهني عند الافتتاح",
      targetCount: 180000,
      showOncePerDay: true,
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
      form: {
        enabled: true,
        name: { enabled: true, required: true },
        phone: { enabled: true, required: true },
        email: { enabled: false, required: false },
        submitLabel: "إرسال البيانات",
      },
    },
  });

  if (!insertError) {
    redirect(`/stores/${storeId}/popups`);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-bold text-red-600">
        خطأ أثناء إنشاء Popup افتتاح
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
