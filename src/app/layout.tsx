import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import Reveal from "@/components/Reveal";
import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/env";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  alternateName: SITE.nameEn,
  description: "گیم‌نت حرفه‌ای با سیستم‌های RTX 4070، کنسول PS5 و XBOX، رزرو آنلاین و مسابقات هفتگی",
  url: SITE_URL,
  telephone: "+982191000000",
  address: { "@type": "PostalAddress", addressLocality: "تهران", streetAddress: SITE.address, addressCountry: "IR" },
  openingHours: "Mo-Sa 09:00-24:00",
  priceRange: "$$",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "گیم‌نت آرنا ایکس | ARENA X — میدان نبرد گیمرهای حرفه‌ای",
    template: "%s | گیم‌نت آرنا ایکس",
  },
  description: "گیم‌نت حرفه‌ای آرنا ایکس با سیستم‌های RTX 4070، کنسول‌های PS5 و XBOX، اینترنت فیبر نوری، اتاق تیمی VIP، کافه گیمینگ و مسابقات هفتگی با جوایز نقدی. رزرو آنلاین سیستم و کنسول.",
  keywords: ["گیم‌نت", "رزرو گیم‌نت", "مسابقات بازی", "PS5", "کامپیوتر گیمینگ", "آرنا ایکس", "gamenet"],
  openGraph: { type: "website", locale: "fa_IR", siteName: "گیم‌نت آرنا ایکس" },
  twitter: { card: "summary", title: "گیم‌نت آرنا ایکس | ARENA X", description: "رزرو آنلاین سیستم و کنسول، مسابقات هفتگی با جوایز نقدی" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800;900&family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
          <ChatWidget />
          <Reveal />
        </Providers>
      </body>
    </html>
  );
}
