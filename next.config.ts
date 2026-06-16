import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Üst klasördeki package-lock.json yüzünden Turbopack kökü yanlış seçmesin.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
