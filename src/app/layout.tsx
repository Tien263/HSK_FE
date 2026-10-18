import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Huayu Chinese - Đào Tạo Tiếng Trung & Luyện Thi HSK Chuẩn Quốc Tế",
  description: "Khóa học Hán ngữ trực tuyến cam kết chuẩn đầu ra HSK 1 đến HSK 6 với phương pháp hiện đại.",
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
