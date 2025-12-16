"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; // path นี้ตรงกับโครงสร้างในรูปของคุณ
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 1. ตรวจสอบว่าใช่อีเมลองค์กรหรือไม่
        if (currentUser.email.endsWith("@fufonglabs.com")) {
          setUser(currentUser);
          // ถ้าล็อกอินผ่านแล้ว แต่อยู่หน้า login ให้ดีดไปหน้าแรก
          if (pathname === "/login") {
            router.push("/");
          }
        } else {
          // 2. ถ้าอีเมลผิด (เช่นใช้ Gmail ส่วนตัว) ให้เตะออกทันที
          await signOut(auth);
          setUser(null);
          alert("ขออภัย! อนุญาตเฉพาะบัญชี @fufonglabs.com เท่านั้น");
          router.push("/login");
        }
      } else {
        // 3. ถ้าไม่ได้ล็อกอิน
        setUser(null);
        // ถ้าไม่ได้อยู่หน้า login ให้ดีดไปหน้า login
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // หน้า Loading ระหว่างเช็คสิทธิ์ (กันหน้าเว็บกระพริบเห็น content)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />
        <p className="text-slate-400 text-sm font-light">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};