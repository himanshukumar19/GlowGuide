import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://glowguide.vercel.app"),
  title: "GlowGuide - Your Complete Skincare Education Platform",
  description:
    "Discover your skin type, build personalized routines, and learn expert skincare tips for all ages. Your complete guide to healthy, glowing skin.",
  authors: [{ name: "GlowGuide" }],
  openGraph: {
    title: "GlowGuide - Skincare Education Platform",
    description:
      "Expert skincare education for every skin type, age, and concern. Take our quiz and start your journey to healthy skin.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  icons: {
    icon: { type: "image/png", url: "/favicon.png" },
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
