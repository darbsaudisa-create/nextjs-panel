// app/layout.tsx

import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Widgets Panel",
  description: "لوحة التحكم لإدارة Widgets لمتاجر درب وسلة",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
