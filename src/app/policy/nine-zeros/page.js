// src/app/policy/nine-zeros/page.js
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Kanit } from "next/font/google";
import { nineZeros, getIcon } from "../../../data/nineZeros";

// ตั้งค่าฟอนต์
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function NineZerosPage() {
  const bgColor = "bg-[#f0fdfa]"; // สีพื้นหลังอ่อนๆ คล้าย Infographic

  // Animation สำหรับการ์ด
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen ${bgColor} ${kanit.className} text-slate-800 overflow-x-hidden selection:bg-teal-500 selection:text-white`}>
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-start items-center bg-white/90 backdrop-blur-md border-b border-teal-200 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-teal-600 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-wide">Homepage</span>
        </Link>
      </nav>

      {/* --- Hero Header --- */}
      <header className="pt-32 pb-16 px-6 md:px-12 text-center border-b-4 border-teal-600 shadow-inner">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <h1 className="text-5xl md:text-6xl font-extrabold text-teal-800 mb-2">พันธกิจ 9 ศูนย์</h1>
            <p className="text-xl md:text-2xl font-light text-slate-600">
                Nine Zeros Mission: วิสัยทัศน์สู่คุณภาพชีวิตคนไทยเป็นศูนย์
            </p>
            <div className="h-1 w-24 bg-teal-600 mx-auto mt-6 rounded-full"></div>
        </motion.div>
      </header>

      {/* --- Grid Content --- */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {nineZeros.map((item, index) => {
            const Icon = getIcon(item.icon); // ดึง Icon Component มาใช้
            
            // --- [FIXED] ส่วนที่แก้บั๊ก: เช็คค่าสีก่อนใช้งาน ---
            // 1. ลองหา color หรือ activeColor หรือใช้ค่า default (bg-teal-500)
            const rawColor = item.color || item.activeColor || "bg-teal-500";
            
            // 2. คำนวณ class สีต่างๆ อย่างปลอดภัย
            const borderColor = rawColor.includes('bg-') ? rawColor.replace('bg-', 'border-') : 'border-teal-500';
            const iconBgColor = rawColor.includes('500') ? rawColor.replace('500', '100') : 'bg-teal-100';
            // ----------------------------------------------

            return (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                variants={cardVariants}
                // กล่องการ์ด (ใช้ตัวแปร borderColor ที่คำนวณแล้ว)
                className={`p-6 rounded-2xl shadow-lg border-t-4 ${borderColor} bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {/* Icon (ใช้ตัวแปร iconBgColor ที่คำนวณแล้ว) */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    <Icon size={24} className={`text-teal-700`} />
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{item.id}. {item.title}</h2>
                    <h3 className="text-md font-semibold text-teal-700">{item.subtitle || item.titleTh}</h3> 
                    {/* เพิ่ม fallback titleTh เผื่อ subtitle ไม่มี */}
                  </div>
                </div>

                <p className="text-slate-600 text-sm mt-3 mb-4 font-light">
                    {item.goal}
                </p>

                {/* ปุ่มดูรายละเอียด */}
                <Link href={`#${item.id}`} className="text-xs font-bold uppercase tracking-wide text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1">
                    ดูเป้าหมายเชิงลึก <ArrowRight size={14} />
                </Link>

              </motion.div>
            );
          })}

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-8 mt-12 bg-white text-slate-500 text-sm border-t border-teal-200">
          Nine Zeros Mission: A Commitment to the People's Quality of Life.
      </footer>
    </div>
  );
}