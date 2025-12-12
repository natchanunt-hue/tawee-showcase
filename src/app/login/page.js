"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { Kanit } from "next/font/google";
import { Loader2, LogIn } from "lucide-react"; // เพิ่มไอคอนสวยๆ

const kanit = Kanit({ subsets: ["thai"], weight: ["400", "700"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // เริ่มต้นเป็น true เพื่อเช็คสถานะก่อน
  const router = useRouter();

  // 1. เช็คก่อนว่าล็อกอินค้างไว้ไหม? ถ้าใช่ ดีดไปหน้า Admin เลย
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin");
      } else {
        setLoading(false); // ถ้ายังไม่ล็อกอิน ให้แสดงฟอร์ม
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // 2. กดปุ๊บ หมุนปั๊บ กันกดย้ำ
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin"); 
    } catch (err) {
      console.error(err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false); // ถ้าผิดพลาด ให้หยุดหมุนแล้วแสดง error
    }
  };

  // ระหว่างเช็คสถานะ ให้แสดงหน้าจอว่างๆ หรือ Loading (กันหน้ากระพริบ)
  if (loading && !email && !password) {
      return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32}/></div>;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-100 ${kanit.className} p-4`}>
      <form onSubmit={handleLogin} className="p-8 md:p-10 bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                <LogIn size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-1">เข้าสู่ระบบจัดการข้อมูล</p>
        </div>
        
        {error && (
            <motion_error_wrapper>
                <p className="text-red-600 text-sm mb-6 text-center bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2">
                    ⚠️ {error}
                </p>
            </motion_error_wrapper>
        )}
        
        <div className="mb-4">
            <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Email</label>
            <input 
                type="email" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-800" 
                placeholder="name@example.com"
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
        </div>
        
        <div className="mb-8">
            <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Password</label>
            <input 
                type="password" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-800" 
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? <><Loader2 className="animate-spin" size={20}/> กำลังตรวจสอบ...</> : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}