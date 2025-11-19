// app/page.tsx

import { redirect } from "next/navigation";

export default function RootPage() {
  // لاحقًا بنفحص لو فيه جلسة مستخدم، نوجّهه للـ dashboard بدل login
  redirect("/login");
}
