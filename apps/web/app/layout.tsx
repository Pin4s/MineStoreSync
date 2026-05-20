import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Web",
  description: "Web app"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
