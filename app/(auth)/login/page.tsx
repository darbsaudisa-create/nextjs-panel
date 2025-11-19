// app/(auth)/login/page.tsx

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "تعذر تسجيل الدخول.");
        setLoading(false);
        return;
      }

      // نجاح → تحويل للـ dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setErrorMsg("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">تسجيل الدخول إلى لوحة Widgets</h1>
        <p className="text-xs text-gray-500">
          استخدم بيانات حسابك الخاصة بالـ Widgets Panel لإدارة المتاجر والودجت.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60 focus:border-slate-900/60"
            placeholder="example@darb.com.sa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            كلمة المرور
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60 focus:border-slate-900/60"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900"
            />
            <span className="text-gray-600">تذكّرني على هذا الجهاز</span>
          </label>

          <Link
            href="/reset-password"
            className="text-slate-900 font-medium hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 text-white text-sm py-2.5 font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
