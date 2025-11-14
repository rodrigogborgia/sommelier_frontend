/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  env: {
    // Producción: el front conversa con el backend detrás de Nginx por HTTPS
    NEXT_PUBLIC_API_BASE_URL: "https://tusommeliervirtual.com/api",
  },
  // Si usás imágenes externas, configurá aquí:
  // images: { domains: ['cdn.heygen.com'] },
};

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(nextConfig, {
  org: "gamifica",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
