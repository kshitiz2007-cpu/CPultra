import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivilPrep Ultra - Gyankunj Academy",
  description: "Complete UPSC, MPPSC & SSC preparation platform with AI-powered mock tests, resources & analytics.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-surface text-text-primary dark:bg-gray-950 dark:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}