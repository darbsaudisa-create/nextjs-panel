"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// كائن Supabase للمتصفح (نستخدمه هنا فقط)
const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Supabase يرسل التوكن في الـ URL (fragment/hash) مثل:
  // http://localhost:3000/update-password#access_token=...
  useEffect(() => {
    async function handleRecovery() {
      // Supabase تتكفل بقراءة الـ hash وتثبيت الجلسة داخليًا
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Recovery session error:", error);
        setTokenValid(false);
        return;
      }

      setTokenValid(true);
    }

    handleRecovery();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }

    if (password !== password2) {
      setErrorMsg("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Update password error:", error);
        setErrorMsg("تعذر تحديث كلمة المرور. حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // بعد ثانيتين نرجع المستخدم لصفحة تسجيل الدخول
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg("خطأ غير متوقع. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  // حالة التحقق من التوكن
  if (tokenValid === false) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">رابط غير صالح</h1>
          <p className="text-xs text-gray-500">
            يبدو أن رابط استرجاع كلمة المرور منتهي أو غير صالح. حاول طلب رابط
            جديد من صفحة استرجاع كلمة المرور.
          </p>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="space-y-4 text-center text-xs text-gray-500">
        جاري التحقق من رابط الاسترجاع...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">تعيين كلمة مرور جديدة</h1>
        <p className="text-xs text-gray-500">
          أدخل كلمة مرور جديدة لحسابك في لوحة Widgets. تأكد من اختيار كلمة قوية
          وسهلة التذكّر.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {success && !errorMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          تم تحديث كلمة المرور بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول خلال
          لحظات...
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            كلمة المرور الجديدة
          </label>
          <input
            type="password"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60 focus:border-slate-900/60"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            تأكيد كلمة المرور الجديدة
          </label>
          <input
            type="password"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60 focus:border-slate-900/60"
            placeholder="••••••••"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 text-white text-sm py-2.5 font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "جاري حفظ كلمة المرور..." : "حفظ كلمة المرور الجديدة"}
        </button>
      </form>
    </div>
  );
}
