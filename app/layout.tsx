import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מחולל תובנות",
  description: "תובנות חכמות על החיים",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
