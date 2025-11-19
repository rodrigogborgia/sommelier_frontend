/** @type {import('next').NextConfig} */

// Detectar commit hash desde el entorno (GitHub Actions, Vercel, etc.)
const commitHash =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  "local-dev";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  env: {
    // Producción: el front conversa con el backend detrás de Nginx por HTTPS
    NEXT_PUBLIC_API_BASE_URL: "https://tusommeliervirtual.com/api",
    // Exponer commit hash/version al frontend
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
  },
  // Si usás imágenes externas, configurá aquí:
  // images: { domains: ['cdn.heygen.com'] },
};

module.exports = nextConfig;
