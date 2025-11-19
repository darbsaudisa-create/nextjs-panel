"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function PanelShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const isStores = pathname.startsWith("/stores");
  const isWidgets = pathname.startsWith("/widgets");
  const isEvents = pathname.startsWith("/events");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* ============ 1) Sidebar ثابت للديسكتوب ============ */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:bg-slate-900 md:text-slate-50 md:min-h-screen">
          {/* Header */}
          <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
            <span className="text-lg font-bold">Widgets Panel</span>
          </div>

          {/* متجر + حالة النظام */}
          <div className="px-4 py-3 border-b border-slate-800 text-xs space-y-1">
            <div className="font-semibold text-sm">مدرار قطع غيار السيارات</div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700/30 px-2 py-0.5 text-[11px] text-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                النظام مستقر
              </span>
              <button className="text-[11px] underline text-slate-300">
                زيارة المتجر
              </button>
            </div>
          </div>

          {/* قائمة التنقل */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
            <div className="text-[11px] text-slate-400 px-2 mb-1">
              لوحة التحكم
            </div>

            <Link
              href="/dashboard"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isDashboard
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              الرئيسية
            </Link>

            <Link
              href="/stores"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isStores
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              المتاجر
            </Link>

            <Link
              href="/widgets"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isWidgets
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              Widgets
            </Link>

            <Link
              href="/events"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isEvents
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              الأحداث (Events)
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <button className="w-full text-start rounded-lg px-3 py-2 text-red-200 hover:bg-red-900/40 transition text-xs">
                تسجيل الخروج
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 text-[11px] text-slate-400 border-t border-slate-800 text-start">
            Darb Widgets &copy; {new Date().getFullYear()}
          </div>
        </aside>

        {/* ============ 2) Drawer للجوال فقط ============ */}
        {open && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 bottom-0 right-0 z-40 w-72 bg-slate-900 text-slate-50 flex flex-col transform transition-transform duration-300 md:hidden ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between border-b border-slate-800 px-4">
            <span className="text-lg font-bold">Widgets Panel</span>
            <button
              className="text-slate-300 text-2xl leading-none"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="px-4 py-3 border-b border-slate-800 text-xs space-y-1">
            <div className="font-semibold text-sm">مدرار قطع غيار السيارات</div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700/30 px-2 py-0.5 text-[11px] text-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                النظام مستقر
              </span>
              <button className="text-[11px] underline text-slate-300">
                زيارة المتجر
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
            <div className="text-[11px] text-slate-400 px-2 mb-1">
              لوحة التحكم
            </div>

            <Link
              href="/dashboard"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isDashboard
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
              onClick={() => setOpen(false)}
            >
              الرئيسية
            </Link>

            <Link
              href="/stores"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isStores
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
              onClick={() => setOpen(false)}
            >
              المتاجر
            </Link>

            <Link
              href="/widgets"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isWidgets
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
              onClick={() => setOpen(false)}
            >
              Widgets
            </Link>

            <Link
              href="/events"
              className={`block rounded-lg px-3 py-2 transition text-sm ${
                isEvents
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-100 hover:bg-slate-800/60"
              }`}
              onClick={() => setOpen(false)}
            >
              الأحداث (Events)
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                className="w-full text-start rounded-lg px-3 py-2 text-red-200 hover:bg-red-900/40 transition text-xs"
                onClick={() => setOpen(false)}
              >
                تسجيل الخروج
              </button>
            </div>
          </nav>

          <div className="p-3 text-[11px] text-slate-400 border-t border-slate-800 text-center">
            Darb Widgets &copy; {new Date().getFullYear()}
          </div>
        </aside>

        {/* ============ 3) منطقة المحتوى ============ */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <header className="h-16 border-b bg-white flex items-center justify-between px-3 md:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {/* زر القائمة للجوال فقط */}
              <button
                className="md:hidden mr-1 flex h-9 w-9 items-center justify-center rounded-full border bg-white"
                onClick={() => setOpen(true)}
              >
                <span className="block w-4 border-t border-slate-900" />
                <span className="block w-4 border-t border-slate-900 mt-1" />
                <span className="block w-4 border-t border-slate-900 mt-1" />
              </button>

              <div className="hidden md:flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  DW
                </div>
                <div className="leading-tight text-sm">
                  <div className="font-semibold">
                    شركة مدرار لقطع غيار السيارات
                  </div>
                  <div className="text-xs text-gray-500">لوحة تحكم Widgets</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-600">
              <span className="px-2 py-1 rounded-full bg-slate-100 whitespace-nowrap">
                حالة النظام:{" "}
                <span className="font-semibold text-emerald-600">مستقر</span>
              </span>
              <button className="hidden sm:inline-flex px-3 py-1 rounded-full border text-[10px] md:text-xs hover:bg-slate-50">
                توثيق الـ API
              </button>
            </div>
          </header>

          <main className="flex-1 bg-slate-50">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
