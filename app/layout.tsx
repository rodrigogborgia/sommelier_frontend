import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css"; // Ruta corregida

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Espacio Sommelier | Asistente de Carnes IA",
  description: "Asistente de IA de Espacio Sommelier experto en carnes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 👇 Esto se ejecuta en el navegador y te muestra el commit
  if (typeof window !== "undefined") {
    console.log("Frontend commit:", process.env.NEXT_PUBLIC_COMMIT_HASH);
  }

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
