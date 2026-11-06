import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import HanziiDictionaryDrawer from "@/components/common/HanziiDictionaryDrawer";
import PwaInstallBanner from "@/components/common/PwaInstallBanner";
import { getSeoConfig } from "@/lib/seo-config";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoConfig();
  const baseUrl = (seo.canonicalUrl || "https://ninjistudy.click").replace(/\/$/, "");

  const keywordsArray = seo.keywords
    ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        "học tiếng trung",
        "luyện thi hsk",
        "hsk 3.0",
        "tự học hsk",
        "tiếng trung cô ning ning",
        "ninjistudy",
        "đề thi thử hsk",
      ];

  const ogImageUrl = seo.ogImage || `${baseUrl}/theme/og-social-preview.png`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.title,
      template: `%s · ${seo.siteName}`,
    },
    description: seo.description,
    keywords: keywordsArray,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Hanyu HSK",
    },
    icons: {
      icon: [
        { url: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/brand/app-icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${seo.siteName} - Học Tiếng Trung HSK 3.0`,
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImageUrl],
    },
    robots: {
      index: seo.allowIndexing,
      follow: seo.allowIndexing,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoConfig();
  const baseUrl = (seo.canonicalUrl || "https://ninjistudy.click").replace(/\/$/, "");

  // Schema.org Structured Data (JSON-LD) cho Google Search
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": seo.siteName,
        "description": seo.description,
        "inLanguage": "vi-VN",
      },
      {
        "@type": "EducationalApplication",
        "@id": `${baseUrl}/#app`,
        "name": "Hanyu - Nền tảng Học Tiếng Trung HSK 3.0",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "url": baseUrl,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "VND",
        },
        "description": seo.description,
      },
      {
        "@type": "Course",
        "@id": `${baseUrl}/#course`,
        "name": "Lộ trình luyện thi HSK 3.0 Chuẩn Quốc Tế (HSK 1 - HSK 6)",
        "description": "Khoá học và luyện thi HSK 3.0 từ sơ cấp đến cao cấp với AI đàm thoại, kiểm tra phát âm và bài giảng độc quyền.",
        "provider": {
          "@type": "Organization",
          "name": "Hanyu HSK",
          "sameAs": baseUrl,
        },
      },
    ],
  };

  return (
    <html lang="vi" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#061609] text-white font-sans selection:bg-[#c3dc4e] selection:text-[#061609]">
        {children}
        <HanziiDictionaryDrawer />
        <Suspense fallback={null}>
          <PwaInstallBanner />
        </Suspense>
      </body>
    </html>
  );
}
