import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Lớp Tiếng Trung Cô Ning Ning - Ôn Đúng Bài, Luyện Đúng Chuẩn HSK 3.0",
  description: "Website nội bộ dành cho học viên lớp cô Ning Ning. Không gian ôn bài, luyện đề và chơi game từ vựng mỗi ngày.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#061609] text-white font-sans selection:bg-[#c3dc4e] selection:text-[#061609]">
        {children}
      </body>
    </html>
  );
}
