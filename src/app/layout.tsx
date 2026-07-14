import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/src/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { PortalWidget } from "shanu-portal-widget";

// Space Grotesk is the single UI typeface — body AND display. Full weight
// range so body copy (400/500) and headings (600/700) all use it.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nextlevel.shanu.dev"),
  title: {
    default: "NextLevel",
    template: "%s | NextLevel",
  },
  description: "Track your games, build your catalog, and share your profile.",
  openGraph: {
    type: "website",
    siteName: "NextLevel",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={`${geistMono.variable} antialiased`}>
        {children}
        <PortalWidget />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
