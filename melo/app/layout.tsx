import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melo — 让音乐听懂你的情绪",
  description: "AI音乐陪伴伙伴。探索音乐与情绪的未来体验。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head><link rel="preload" as="image" href="/mascot/melo-reference-cutout.png" fetchPriority="high" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
