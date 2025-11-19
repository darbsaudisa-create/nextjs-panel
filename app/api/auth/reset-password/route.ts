// app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

const supabaseAuth = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email as string | undefined)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "الرجاء إدخال البريد الإلكتروني." },
        { status: 400 }
      );
    }

    // رابط إعادة التعيين (مؤقتاً نخليه يرجع للوحة لاحقاً نعمل صفحة تغيير كلمة المرور)
    const redirectUrl =
      process.env.NEXT_PUBLIC_RESET_REDIRECT_URL ||
      "http://localhost:3000/update-password";

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Supabase reset error:", error);
      return NextResponse.json(
        { ok: false, error: "تعذر إرسال رابط الاسترجاع." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Unexpected reset error:", err);
    return NextResponse.json(
      { ok: false, error: "خطأ غير متوقع. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
