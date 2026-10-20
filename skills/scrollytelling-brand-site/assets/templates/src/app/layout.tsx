import type { Metadata, Viewport } from "next";
import { Unbounded, Inter, Silkscreen, Barlow_Condensed } from "next/font/google";
import { SmoothScroll } from "@/core/providers/SmoothScroll";
import { RouteEffects } from "@/core/providers/RouteEffects";
import { site } from "@/core/config/site";
import { primaryContact, toIntl } from "@/core/config/contact";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-silkscreen",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "800"],
  style: "italic",
  variable: "--font-barlow",
  display: "swap",
  preload: false, // first appears mid-scroll; don't compete with the hero
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s — Demo" },
  description: site.description,
  keywords: [
    "prototyping",
    "product design",
    "design and engineering",
    "architectural maquette",
    "architectural model",
    "product prototype",
    "3D printing",
    "small-batch manufacturing",
    "PCB design",
    "Egypt",
    "Cairo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: "Demo",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Demo — The House of Prototyping",
  description: site.description,
  url: site.url,
  logo: `${site.url}/images/brand/logo-full.png`,
  telephone: `+${toIntl(primaryContact.phone)}`,
  areaServed: "EG",
  knowsAbout: [
    "Design & engineering",
    "Architectural maquettes",
    "Prototyping",
    "3D printing",
    "Small-batch manufacturing",
    "PCB design",
  ],
};

export const viewport: Viewport = {
  themeColor: "#00264d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${inter.variable} ${silkscreen.variable} ${barlow.variable}`}
    >
      <body data-loading="true">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <RouteEffects />
          {children}
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
