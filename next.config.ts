import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// ── Security headers (appliqués globalement) ──────────────────
const securityHeaders = [
  // Empêche le sniffing MIME
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Empêche l'embed du site dans une iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Politique référer minimale
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS — force HTTPS sur 1 an (Vercel = HTTPS par défaut)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Limite les permissions navigateur
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Empêche XSS legacy
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.vercel-storage.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["react-icons", "lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
