import type { Metadata } from "next";
import "./globals.css";
import HanziiDictionaryDrawer from "@/components/common/HanziiDictionaryDrawer";

export const metadata: Metadata = {
  title: "Lớp Tiếng Trung Cô Ning Ning - Ôn Đúng Bài, Luyện Đúng Chuẩn HSK 3.0",
  description: "Website nội bộ dành cho học viên lớp cô Ning Ning. Không gian ôn bài, luyện đề và chơi game từ vựng mỗi ngày.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#061609] text-white font-sans selection:bg-[#c3dc4e] selection:text-[#061609]">
        {children}
        <HanziiDictionaryDrawer />
      </body>
    </html>
  );
}
