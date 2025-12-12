/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // สัญลักษณ์ ** หมายถึงอนุญาตทุกเว็บที่เป็น https
      },
    ],
  },
};

export default nextConfig;