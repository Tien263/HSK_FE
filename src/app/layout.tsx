import type { Metadata } from "next";
import "./globals.css";
import HanziiDictionaryDrawer from "@/components/common/HanziiDictionaryDrawer";
import { getSeoConfig } from "@/lib/seo-config";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoConfig();
  const baseUrl = (seo.canonicalUrl || "https://ninjistudy.click").replace(/\/$/, "");

  const keywordsArray = seo.keywords
    ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : ["học tiếng trung", "luyện thi hsk", "ninjistudy"];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.title,
      template: `%s · ${seo.siteName}`,
    },
    description: seo.description,
    keywords: keywordsArray,
    verification: seo.googleVerificationCode
      ? { google: seo.googleVerificationCode }
      : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: baseUrl,
      siteName: seo.siteName,
      images: [
        {
          url: seo.ogImage || `${baseUrl}/theme/bg-auth-master.jpg`,
          width: 1200,
          height: 630,
          alt: seo.siteName,
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    robots: {
      index: seo.allowIndexing,
      follow: seo.allowIndexing,
    },
  };
}

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
