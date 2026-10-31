// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   devIndicators: false,
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dxgtomyerqb7c8ly.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
