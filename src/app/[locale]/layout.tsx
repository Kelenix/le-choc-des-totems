import type { Metadata, Viewport } from "next";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://lechocdestotems.store"),
  title: {
    default: "Le Choc des Totems | Pronostics Coupe du Monde",
    template: "%s | Le Choc des Totems",
  },
  description: "Pronostique les matchs de la Coupe du Monde en votant pour l'animal totem de chaque nation.",
  keywords: ["coupe du monde", "pronostics", "football", "totems"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Le Choc des Totems",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Choc Totems" },
};

export const viewport: Viewport = {
  themeColor: "#070B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" data-scroll-behavior="smooth">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3959323552298640"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full bg-[#070B14] text-white antialiased overflow-x-hidden">
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
