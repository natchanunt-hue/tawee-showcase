import "./globals.css";
import { Kanit } from "next/font/google";
import { AuthProvider } from "../context/AuthContext"; // Import ตัวที่เราเพิ่งสร้าง

const kanit = Kanit({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "600", "700"], 
  display: "swap" 
});

export const metadata = {
  title: "Tawee Sodsong Showcase",
  description: "Internal System",
  robots: { index: false, follow: false }, // ป้องกัน Google bot เพราะเป็นเว็บภายใน
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={kanit.className}>
        {/* ครอบ AuthProvider ไว้ตรงนี้ เพื่อบังคับ login ทั้งเว็บ */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}