"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Props = {
  storeId: string;
  widgetId: string;
  isActive: boolean;
};

export default function PopupActions({ storeId, widgetId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] =
    React.useState<"none" | "status" | "delete">("none");

  async function toggleStatus() {
    setLoading("status");
    try {
      await fetch(`/api/widgets/${widgetId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isActive ? "paused" : "active",
        }),
      });
      router.refresh();
    } catch (_) {
    } finally {
      setLoading("none");
    }
  }

  async function deletePopup() {
    if (!confirm("هل أنت متأكد من حذف هذا الـ Popup نهائيًا؟")) return;
    setLoading("delete");
    try {
      await fetch(`/api/widgets/${widgetId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (_) {
    } finally {
      setLoading("none");
    }
  }

  function goToSettings() {
    // تنقّل بدون ريفرش كامل
    router.push(`/stores/${storeId}/popups/${widgetId}`);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {/* زر إعدادات Popup بدون <Link>/<a> */}
      <button
        type="button"
        onClick={goToSettings}
        className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      >
        إعدادات Popup
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={loading !== "none"}
          className={
            "px-2 py-1 rounded-full text-[11px] font-semibold border " +
            (isActive
              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100")
          }
        >
          {loading === "status"
            ? "جاري التحديث..."
            : isActive
            ? "إيقاف"
            : "تفعيل"}
        </button>

        <button
          type="button"
          onClick={deletePopup}
          disabled={loading !== "none"}
          className="px-2 py-1 rounded-full text-[11px] font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
        >
          {loading === "delete" ? "جاري الحذف..." : "حذف"}
        </button>
      </div>
    </div>
  );
}
