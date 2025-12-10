"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { Kanit } from "next/font/google";

const kanit = Kanit({ subsets: ["thai"], weight: ["400", "700"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin"); // ถ้าผ่าน ให้ไปหน้า Admin
    } catch (err) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-100 ${kanit.className}`}>
      <form onSubmit={handleLogin} className="p-10 bg-white rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">Admin Login</h1>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-slate-700">Email</label>
            <input type="email" className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-amber-500" 
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-slate-700">Password</label>
            <input type="password" className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:border-amber-500" 
            onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="w-full bg-amber-600 text-white p-3 rounded-lg font-bold hover:bg-amber-700 transition">
            เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}