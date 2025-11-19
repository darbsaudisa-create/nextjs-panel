// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!anonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

// هذا الكلاينت مخصص للمصادقة فقط (auth) باستخدام anon key
const supabaseAuth = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const password = body.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور." },
        { status: 400 }
      );
    }

    // تسجيل الدخول باستخدام Supabase Auth
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error?.message === "Invalid login credentials"
              ? "بيانات الدخول غير صحيحة."
              : "تعذر تسجيل الدخول. حاول مرة أخرى.",
        },
        { status: 401 }
      );
    }

    const userId = data.user.id;

    // إنشاء كوكي بسيط للجلسة يحتوي على userId
    const res = NextResponse.json({ ok: true }, { status: 200 });

    res.cookies.set("widgets_session", String(userId), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 ساعات
    });

    return res;
  } catch (err) {
    console.error("Unexpected error (login):", err);
    return NextResponse.json(
      { ok: false, error: "خطأ غير متوقع. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
