import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "HSK Master - Học & Ôn Tập Tiếng Trung Chuẩn Hanban",
  description: "Trang web học và ôn tập HSK từ số 0 đến HSK 6 với lộ trình chuẩn, thẻ từ vựng và đề thi thử trực tuyến miễn phí.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#faf9f5] text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
