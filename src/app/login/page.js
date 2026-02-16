"use client";
import { useState } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { auth } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";

// ไอคอน Google SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ฟังก์ชัน Login ด้วย Google
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // เช็ค Domain หลังจาก Login ผ่าน Google สำเร็จ
        if (!user.email.endsWith("@fufonglabs.com") && user.email !== "wansao@izocialth.com") {
            await signOut(auth); // ถ้าไม่ใช่เมลบริษัท ให้เตะออกทันที
            setError("อนุญาตเฉพาะ Google Account ของ @fufonglabs.com เท่านั้น");
            setLoading(false);
            return;
        }

        router.push("/");
    } catch (err) {
        console.error(err);
        // กรณีปิด Popup หรือ Error อื่นๆ
        if (err.code !== 'auth/popup-closed-by-user') {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google");
        }
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dedee1] p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
        <div className="text-center mb-10">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                <LockKeyhole size={36} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Restricted Access</h1>
            <p className="text-slate-500 text-sm mt-2">ยืนยันตัวตนด้วยบัญชีองค์กร</p>
        </div>
        
        {error && (
            <div className="mb-8 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                ⚠️ {error}
            </div>
        )}

        {/* ปุ่ม Google Login เพียงอย่างเดียว */}
        <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
            {loading ? (
                <Loader2 className="animate-spin text-slate-400" size={24}/> 
            ) : (
                <>
                    <div className="group-hover:scale-110 transition-transform duration-300">
                        <GoogleIcon />
                    </div>
                    <span className="text-base">เข้าสู่ระบบด้วย Google</span>
                </>
            )}
        </button>
        
        <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Secure System by FufongLabs</p>
        </div>
      </div>
    </div>
  );
}