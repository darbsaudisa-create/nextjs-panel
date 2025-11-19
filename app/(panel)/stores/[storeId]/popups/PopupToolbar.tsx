"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Props = {
  storeId: string;
  popupCount: number;
};

export default function PopupToolbar({ storeId, popupCount }: Props) {
  const router = useRouter();

  function createSalePopup() {
    router.push(`/stores/${storeId}/popups/new`);
  }

  function createLaunchPopup() {
    router.push(`/stores/${storeId}/popups/new-launch`);
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1 text-sm text-slate-600">
        <div>
          عدد الـ Popups لهذا المتجر:{" "}
          <span className="font-semibold">{popupCount}</span>
        </div>
        <div className="text-xs text-slate-500">
          يمكنك تفعيل أكثر من Popup، وسيتم التحكم في طريقة العرض من خلال
          إعدادات كل ويدجت.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={createSalePopup}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50"
        >
          <span className="text-lg leading-none">＋</span>
          <span>إضافة Popup عرض</span>
        </button>

        <button
          type="button"
          onClick={createLaunchPopup}
          className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm hover:bg-amber-100"
        >
          <span className="text-lg leading-none">★</span>
          <span>إضافة Popup افتتاح</span>
        </button>
      </div>
    </section>
  );
}
