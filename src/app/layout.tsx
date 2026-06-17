import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "أكاديمية الرياضيات",
  description: "تعلم الضرب والقسمة بطريقة ممتعة وتفاعلية",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "الرياضيات",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
