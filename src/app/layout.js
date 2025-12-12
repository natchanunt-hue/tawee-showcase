// src/app/layout.js
import "./globals.css";
import { Kanit } from "next/font/google";

const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

export const metadata = {
  title: "Tawee Sodsong | พ.ต.อ.ทวี สอดส่อง",
  description: "ผลงาน นโยบาย และภารกิจ ของ พ.ต.อ.ทวี สอดส่อง",
  // 🛡️ ป้องกัน Google/Bot ชั่วคราว
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={kanit.className}>{children}</body>
    </html>
  );
}