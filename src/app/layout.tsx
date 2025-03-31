import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChinChin Booth - Unique Photo Booth",
  description: "Capture fun moments, create stickers & WebAR. Try it now!",
  openGraph: {
    title: "ChinChin Booth - Unique Photo Booth",
    description: "Capture fun moments, create stickers & WebAR. Try it now!",
    url: "https://chinchinbooth.vercel.app",
    siteName: "ChinChin Booth",
    // images: [
    //   {
    //     url: "https://chinchinbooth.vercel.app/og-image.jpg",
    //     width: 1200,
    //     height: 630,
    //     alt: "ChinChin Booth",
    //   },
    // ],
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "ChinChin Booth - Unique Photo Booth",
  //   description: "Capture fun moments, create stickers & WebAR. Try it now!",
  //   images: ["https://chinchinbooth.vercel.app/og-image.jpg"],
  // },
  other: {
    "apple-mobile-web-app-title": "ChinChin Booth",
    viewport:
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  },
};

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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
