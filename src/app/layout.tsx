import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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

export const metadata: Metadata = {
  title: "ChinChin Booth - Unique Photo Booth",
  description:
    "Capture fun moments and create photo strips with ChinChin Booth. Try it now!",
  openGraph: {
    title: "ChinChin Booth - Unique Photo Booth",
    description:
      "Capture fun moments and create photo strips with ChinChin Booth. Try it now!",
    url: "https://chinchinbooth.vercel.app",
    siteName: "ChinChin Booth",
    images: [
      {
        url: "https://chinchinbooth.vercel.app/og-image.jpg",
        width: 980,
        height: 980,
        alt: "ChinChin Booth",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChinChin Booth - Unique Photo Booth",
    description:
      "Capture fun moments and create photo strips with ChinChin Booth. Try it now!",
    images: ["https://chinchinbooth.vercel.app/og-image.jpg"],
  },
  other: {
    "apple-mobile-web-app-title": "ChinChin Booth",
    viewport:
      "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
    keywords:
      "photo booth, online camera, photo strips, selfie booth, fun photo app",
    "google-site-verification": "CmR9FlhehVglX9dkwNSyFEp4f62ytM9PzxcFwkhfyIU",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
