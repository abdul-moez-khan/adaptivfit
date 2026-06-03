import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdaptivFit | Your Body's Intelligent Companion",
  description: "AdaptivFit is your personal AI fitness ecosystem — driven by intelligent agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

