/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Habilitar el modo estricto de React
  swcMinify: true,       // Minificación con SWC

};

// Importar el módulo de PWA
import withPWAInit from "@ducanh2912/next-pwa";

// Configurar PWA
const withPWA = withPWAInit({
  dest: "public", // Carpeta donde se guardará el Service Worker
});

// Exportar la configuración combinada
export default withPWA(nextConfig);
