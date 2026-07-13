import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";
import Providers from "@/components/Providers";
import "@/styles/global.scss";

// Friendly, readable body font.
const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

// Rounded, playful display font for the wordmark and headings.
const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pintora",
  description: "Share and discover Ninja Creami recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
