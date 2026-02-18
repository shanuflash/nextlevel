import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/src/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="en" className={dmSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
