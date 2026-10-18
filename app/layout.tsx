import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Lead Conversion Audit for UAE Real Estate Brokerages | Zykken",
  description: "Discover gaps in your brokerage’s enquiry-to-viewing process. Request a free, personalized 3-point Lead Conversion Audit from Zykken.",
  metadataBase: new URL("https://zykken-uae-lead-audit.zykkenai.chatgpt.site"),
  openGraph: {
    title: "UAE Real Estate Lead Conversion Audit | Zykken",
    description: "Turn a closer eye to what happens after the property enquiry. Request a personalized three-point audit for your brokerage.",
    type: "website",
  },
  icons: { icon: "/assets/zykken-favicon.svg", shortcut: "/assets/zykken-favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preload" href="/assets/urbanist-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
