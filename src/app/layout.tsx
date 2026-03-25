import type { Metadata } from "next";
import { Manrope, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MD Share",
    template: "%s | MD Share",
  },
  description: "Jednoduché sdílení markdown souborů",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} ${geistMono.variable} font-body antialiased bg-background text-on-surface min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
