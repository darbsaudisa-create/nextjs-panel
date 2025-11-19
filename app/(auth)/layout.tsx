// app/(auth)/layout.tsx

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* شعار بسيط أعلى الفورم */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white h-12 w-12 text-xl font-bold mb-2">
            DW
          </div>
          <div className="text-sm text-gray-500">
            لوحة تحكم Widgets لمتاجر درب وسلة
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {children}
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-500">
          Darb Widgets &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
