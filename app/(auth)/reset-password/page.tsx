// app/(auth)/reset-password/page.tsx

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "تعذر إرسال رابط الاسترجاع.");
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("خطأ غير متوقع. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">استرجاع كلمة المرور</h1>
        <p className="text-xs text-gray-500">
          أدخل بريدك الإلكتروني المسجّل في لوحة Widgets، وسنرسل لك رابطًا لإعادة
          تعيين كلمة المرور.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {sent && !errorMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          إذا كان البريد مسجّلًا لدينا، ستصلك رسالة تحتوي على رابط لاسترجاع كلمة
          المرور.
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 text-white text-sm py-2.5 font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "جاري الإرسال..." : "إرسال رابط الاسترجاع"}
        </button>

        <div className="text-center text-xs text-gray-600">
          <span>تذكّرت كلمة المرور؟ </span>
          <Link
            href="/login"
            className="text-slate-900 font-medium hover:underline"
          >
            العودة لصفحة تسجيل الدخول
          </Link>
        </div>
      </form>
    </div>
  );
}
