import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale, getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/site-url";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PhotoBoothSearch");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/",
      siteName: "ChinChin Booth",
      images: [
        { url: "/og-image.jpg", width: 980, height: 980, alt: "ChinChin Booth" },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    verification: { google: "CmR9FlhehVglX9dkwNSyFEp4f62ytM9PzxcFwkhfyIU" },
    other: { "apple-mobile-web-app-title": "ChinChin Booth" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ChinChin Booth",
  alternateName: "chinchinbooth",
  url: `${siteUrl}/`,
};

const analyticsMeasurementId = "G-4SP5EBGDEW";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsMeasurementId}`}
            />
            <Script id="google-analytics">
              {`window.dataLayer = window.dataLayer || [];
                function gtag() { window.dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(analyticsMeasurementId)}, {
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false
                });`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
