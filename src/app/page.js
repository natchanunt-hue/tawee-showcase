"use client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDown, ArrowRight, Menu, X, ChevronDown, ChevronUp, X as CloseIcon, 
  ExternalLink, Facebook, Instagram,
  // ไอคอนเดิมที่มีอยู่
  Circle, Star, Award, Shield, Users, Zap, Target, BookOpen, Heart, Globe,
  // [เพิ่ม] ไอคอนสำหรับ Bio Timeline (ที่ขาดไป)
  Badge, Search, HeartHandshake, Flag, Scale, Landmark 
} from "lucide-react";

import { Kanit } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from 'react';

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

import { projects } from "../data/projects";
import { nineZeros, getIcon } from "../data/nineZeros";
import { bioIntro, bioTimeline } from "../data/bioData"; 

const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

// Helper สำหรับเรียก Icon จากชื่อ string (เนื่องจากเรา import แยกมาแล้ว)
const getIconComponent = (iconName) => {
    const icons = { Circle, Star, Award, Shield, Users, Zap, Target, BookOpen, Heart, Globe, Badge, Search, HeartHandshake, Flag, Scale, Landmark };
    return icons[iconName] || Circle;
};

// --- MODAL COMPONENT (ฉบับแก้ไข: กัน Error .replace is not function) ---
const ZeroDetailModal = ({ item, onClose }) => {
    if (!item) return null;
    
    // DEBUG
    console.log("Modal opened for item:", item.id, "mechanisms:", item.details?.mechanisms);
    
    // [SAFETY 1] ดึงค่า Icon และ Color พร้อมค่า Default กันพัง
    // ถ้า item.activeColor ไม่มีค่า ให้ใช้ "text-slate-500" แทน
    const Icon = getIcon(item.icon);
    const themeColor = item.activeColor || "text-slate-500"; 
    const themeBg = item.activeBg || "bg-slate-50";
    const themeBorder = item.activeBorder || "border-slate-200";

    // [SAFETY 2] ฟังก์ชันช่วยแปลงสี Text เป็นสี BG อย่างปลอดภัย
    const getDotColor = (textColor) => {
        // เช็คว่าเป็น string และมีค่าไหม ถ้าไม่มีให้คืนค่าสีเทา
        if (!textColor || typeof textColor !== 'string') return "bg-slate-500";
        // ลอง replace ดู
        try {
            return textColor.replace("text", "bg");
        } catch (e) {
            return "bg-slate-500"; // ถ้า error ให้ใช้สีเทา
        }
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative z-10 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className={`p-6 md:p-8 ${themeBg} border-b ${themeBorder} flex justify-between items-start sticky top-0 bg-opacity-98 backdrop-blur-sm z-20 shrink-0`}>
                   <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/50 backdrop-blur`}>
                           <Icon size={24} className={themeColor} />
                       </div>
                       <div>
                           <div className="text-xs font-bold uppercase opacity-60 tracking-wider">Mission 0{item.id}</div>
                           <h3 className={`text-xl md:text-2xl font-bold ${themeColor}`}>{item.title}</h3>
                           <p className="text-sm font-medium text-slate-600">{item.titleTh}</p>
                       </div>
                   </div>
                   <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><CloseIcon size={20}/></button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
                    <div>
                        <p className="text-base md:text-lg text-slate-700 leading-relaxed font-light">{item.details?.description}</p>
                    </div>

                    {/* How (Mechanisms) - จุดที่เคย Error */}
                    <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b-2 inline-block pb-1 ${themeBorder} ${themeColor}`}>
                            กลไกสำคัญ (How)
                        </h4>
                        {(() => {
                            const mechs = item?.details?.mechanisms;
                            if (!mechs || mechs.length === 0) {
                                return <p className="text-slate-500 text-sm italic">ยังไม่มีข้อมูลกลไกสำหรับส่วนนี้</p>;
                            }
                            return (
                                <ul className="space-y-4">
                                    {mechs.map((mech, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            {/* Bullet point - ขนาดพอดี สีสวย */}
                                            <div className={`mt-2.5 w-2 h-2 rounded-full shrink-0 bg-amber-500`}></div>
                                            <span className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{mech}</span>
                                        </li>
                                    ))}
                                </ul>
                            );
                        })()}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                         <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${themeColor}`}>
                            {item.details?.graphTitle || "เป้าหมายและตัวชี้วัด"}
                        </h4>
                        <div className="space-y-5">
                            {item.details?.graphs?.map((graph, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs md:text-sm mb-1.5 font-medium text-slate-600">
                                        <span>{graph.label}</span>
                                        <span>{graph.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3 md:h-4 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            whileInView={{ width: `${graph.percent}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={`h-full rounded-full ${graph.color}`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 flex justify-end pt-4 border-t border-slate-200/50">
                            {item.details?.sourceUrl ? (
                                <a 
                                    href={item.details.sourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center gap-1.5 text-[10px] md:text-xs text-slate-400 hover:text-teal-600 transition-colors cursor-pointer py-1"
                                >
                                    <span className="italic font-medium">{item.details?.source}</span>
                                    <ExternalLink size={12} />
                                    <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50">
                                        คลิกเพื่อดูแหล่งข้อมูลอ้างอิง
                                        <span className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-800"></span>
                                    </span>
                                </a>
                            ) : (
                                <span className="text-[10px] md:text-xs text-slate-400 italic text-right block">
                                    {item.details?.source}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- BIO SECTION ---
const BioSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="container mx-auto px-6 md:px-12 -mt-8 md:-mt-6 lg:-mt-2 relative z-40 mb-24 pt-16 md:pt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-w-5xl mx-auto">
          <div onClick={() => setIsOpen(!isOpen)} className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors gap-4">
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-slate-800">รู้จัก พ.ต.อ.ทวี สอดส่อง</h3>
              <p className="text-slate-500 text-sm mt-1">เส้นทางชีวิตและความยุติธรรมที่จับต้องได้</p>
            </div>
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm bg-amber-50 px-5 py-2.5 rounded-full hover:bg-amber-100 transition-colors">
              {isOpen ? "ซ่อนประวัติ" : "อ่านเพิ่มเติม"}
              {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }}>
                <div className="p-6 md:p-12 border-t border-slate-100 bg-slate-50/30">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                      <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-relaxed">"{bioIntro.headline}"</h4>
                      <p className="text-slate-600 italic font-light leading-relaxed mb-8 text-lg">{bioIntro.philosophy}</p>
                      <div className="w-20 h-1 bg-amber-300 mx-auto mb-8 rounded-full"></div>
                      <p className="text-slate-800 font-bold text-lg md:text-xl tracking-wide leading-relaxed whitespace-pre-line bg-white p-6 rounded-xl shadow-sm border border-slate-100">{bioIntro.careerHighlight}</p>
                  </div>
                  <div className="space-y-8 relative border-l-2 border-slate-200 ml-4 md:ml-10 pl-8 md:pl-10 py-4">
                      {bioTimeline.map((item, index) => {
                           const Icon = getIconComponent(item.icon);
                           return (
                              <div key={index} className="relative group">
                                  <div className="absolute -left-[49px] md:-left-[58px] top-1 w-10 h-10 rounded-full bg-white border-4 border-amber-50 group-hover:border-amber-200 transition-colors flex items-center justify-center text-amber-600 shadow-sm"><Icon size={16} /></div>
                                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                                      <span className="text-sm font-bold uppercase tracking-wider text-amber-600 w-32 shrink-0">{item.year}</span>
                                      <div><h5 className="font-bold text-lg text-slate-800 group-hover:text-amber-700 transition-colors">{item.role}</h5><p className="text-slate-600 font-light mt-2 max-w-xl leading-relaxed">{item.desc}</p></div>
                                  </div>
                              </div>
                           )
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
};

// --- NAVBAR ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) { 
        setIsMobileMenuOpen(false); 
        setTimeout(() => { element.scrollIntoView({ behavior: "smooth" }); }, 100);
    }
  };
  const navLinks = [{ name: "หน้าแรก", target: "hero" }, { name: "ภารกิจเพื่อประชาชน", target: "projects" }, { name: "วิสัยทัศน์ 9 ศูนย์", target: "vision" }];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-white/50 backdrop-blur-sm py-4 md:bg-transparent md:py-6"}`}>
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-10 lg:px-16 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={`font-bold text-xl md:text-2xl tracking-tighter ${isScrolled ? "text-slate-800" : "text-slate-700"}`}>TAWEE <span className="text-amber-600">SODSONG</span></div>
        </div>
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <button key={link.name} onClick={() => scrollToSection(link.target)} className={`text-sm font-medium uppercase tracking-wide hover:text-amber-600 transition-colors ${isScrolled ? "text-slate-600" : "text-slate-600"}`}>{link.name}</button>
          ))}
        </div>
        <button className="md:hidden text-slate-800 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "100vh" }} exit={{ opacity: 0, height: 0 }} className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 overflow-hidden">
            <div className="flex flex-col p-6 gap-6 items-center pt-10">
                {navLinks.map((link) => (
                    <button key={link.name} onClick={() => scrollToSection(link.target)} className="text-xl font-bold text-slate-800 py-2 hover:text-amber-600 w-full text-center border-b border-slate-50 last:border-0">{link.name}</button>
                ))}
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function Home() {
  const bgColor = "bg-[#dedee1]";
  // [IMPORTANT] ไม่ใช้ usePathname และไม่ใช้ key ที่ root div
  const [hoveredZero, setHoveredZero] = useState(null);
  const [projectsData, setProjectsData] = useState(projects);
  const [selectedZero, setSelectedZero] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const q = query(collection(db, "projects"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const firebaseItems = [];
            querySnapshot.forEach((doc) => firebaseItems.push({ id: doc.id, ...doc.data() }));
            if (firebaseItems.length > 0) setProjectsData(firebaseItems);
        } catch (error) { console.error("Error:", error); }
    };
    fetchProjects();
  }, []);

  const containerStagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.08 } } };
  const itemPopup = { hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } } };

  return (
    <div className={`min-h-screen ${bgColor} ${kanit.className} text-slate-800 overflow-x-hidden selection:bg-amber-500 selection:text-white`}>
      <Navbar />
      
      {/* HERO */}
      <section id="hero" className="relative flex items-center justify-center overflow-hidden pt-32 md:pt-20 pb-40 md:pb-12 min-h-[90vh]"> 
        <div className="absolute inset-0 z-0"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbz5cKU4VE1GF2TrYueMnNje2npzzw109GnV7MuAX4zq71UEb2EShbQs-HZtMNoQSf51DtgSejfBCxzp8C6XjhaUVmQ0IfYmcsM5_yCqYv5qsTtGjWA7fVZsVr4n04J4vsOZ5Ioig18xgBgDm5W7cXuNCnCiEW2NC5o-EPhcdOkPjb2OPGGnyzYDQoY-W-/s0/bg-main.jpg" alt="Background" className="w-full h-full object-cover opacity-25 grayscale" /><div className="absolute inset-0 bg-gradient-to-b from-[#dedee1]/60 via-transparent to-[#dedee1]"></div></div>
        
        <div className="relative z-10 w-full h-full flex flex-col-reverse md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-10 pt-20 md:pt-0 px-4 sm:px-6 md:px-12 lg:px-16 max-w-6xl mx-auto">
          {/* Text Side */}
          <div className="flex-1 relative flex flex-col items-center md:items-start justify-center z-20 text-center md:text-left min-w-0">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute -top-16 -left-16 md:-top-32 md:-left-12 w-[80vw] max-w-[400px] md:max-w-[600px] h-auto z-0 opacity-10 pointer-events-none"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHsMQuM3GGn1po3jItyUcaLaAZ_pP7sFKDQJ7aXQXwGChsUXcRO8OC-NrEiQ9GFTGc3kDucu5gdBPv0W5UU9LzvIP7Nn0kokzTKAtsNKj7qJgyhgS1eTzk5hdHz1AoXVglJRrCZw_vM9FbR09Uh3EI96zXNUngNIBRfLpYQUHx22t938iqE65JToQQVvfB/s0/quote-shape.png" alt="Quote" className="w-full h-full object-contain transform -rotate-12" /></motion.div>
            
            <motion.div initial="hidden" animate="visible" transition={{ duration: 0.8 }} variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} className="relative z-10 w-full flex flex-col items-center md:items-start">
                <div className="mb-6 md:mb-10 w-[260px] md:w-[380px] lg:w-[480px] shrink-0">
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQNWdzpwUeG8ZWHn2L6wIis_Mu4xZQuZ1aSTrtNRfbiKGDeTyc86pZCf2hbbWi1noBxwD52-nrAjtZ7KTwnYbLEcoKy2RqT2Gy0Jmm6XRsE9Stnz9ogReRIUIeabOhGoEl_5JHThoEF27rp2at-mwgOEJgpRQaUiBm8_MS7C4TBrnFM538yZUEpdTd9scB/s0/Name-sign.png" alt="Tawee Sodsong" className="w-full h-auto object-contain drop-shadow-sm" />
                </div>
                
                <motion.div initial={{ opacity: 0, y: 20, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.3 }} className="max-w-lg px-2 md:px-0 md:pl-6 border-l-2 md:border-l-4 border-amber-600">
                    <blockquote className="text-base md:text-lg lg:text-xl text-slate-700 font-medium italic leading-relaxed">
                        "พหุวัฒนธรรมคือ<span className="text-amber-700 font-bold">ความเสมอภาค...</span> <br/> ไม่ว่าคนเชื้อชาติไหน ศาสนาใด <br/> ต้องมีที่ยืนและมี<span className="text-amber-700 font-bold">ศักดิ์ศรีเท่าเทียมกัน</span>"
                    </blockquote>
                </motion.div>
            </motion.div>
          </div>

          {/* Image Side */}
          <motion.div initial="hidden" animate="visible" transition={{ duration: 0.8, delay: 0.2 }} variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }} className="flex-1 flex justify-end items-center relative z-30 min-w-0 pr-4 md:pr-0">
             <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative w-[280px] sm:w-[340px] md:w-[320px] lg:w-[420px] h-auto shrink-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-tr from-white to-slate-300 rounded-full blur-3xl opacity-50"></div>
                <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc3BXA48fPuLuhTLBKckmG3DG21AsFIrcb8ev3cyB3EgqZIEc4Be1hCRTLvcZ8_jQipeH1wOh_aq3K0_m5ONkC14GY8IuqBdfxRN9WtbZoYdzpM3eNlZaWnBJqw4nkD5WxnHdpYJeDgwTsELefWrwzjfmaho_NPyvVxfKPoJg7Lyuy0qu1CVNxqKnpFsTX/s0/hero-tawee.png" alt="Tawee" loading="eager" className="w-full h-auto object-contain drop-shadow-2xl relative z-10" />
             </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 md:bottom-6 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center animate-bounce cursor-pointer hover:text-amber-700 transition-colors z-50 pointer-events-auto" onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth'})}>
            <span className="text-[10px] uppercase tracking-widest mb-2 font-semibold">Scroll to Explore</span>
            <ArrowDown className="w-5 h-5" />
        </div>
      </section>

      <BioSection />

      {/* PROJECTS SECTION */}
      <section id="projects" className={`py-16 px-6 md:px-12 ${bgColor} relative z-10 overflow-hidden scroll-mt-24`}>
        {/* [แก้ 1] ลด max-w-7xl เป็น max-w-6xl และลด space-y ให้กระชับขึ้น */}
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
          
          {/* [แก้ 2] ลด margin-bottom ของหัวข้อ (mb-20 -> mb-12) และลดขนาดตัวอักษร */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} className="text-center mb-12">
            <span className="text-amber-600 font-bold tracking-widest uppercase text-xs md:text-sm">Key Missions</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-3">ภารกิจเพื่อประชาชน</h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
          </motion.div>
          
          {/* [FIXED] ใช้ div ธรรมดาแทน motion.div */}
          <div className="space-y-12 md:space-y-16">
          {projectsData.map((item, index) => {
             const isEven = index % 2 === 0;
             const delayTime = (index % 4) * 0.15; 

             return (
               <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, y: 50 }} 
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-50px" }} 
                   transition={{ duration: 0.7, delay: delayTime, ease: [0.25, 0.46, 0.45, 0.94] }}
                   // [แก้ 3] ลด gap ระหว่างภาพกับข้อความ (gap-16 -> gap-10)
                   className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-10`}
               >
                 {/* Image Container */}
                 <div className="w-full md:w-1/2 relative group cursor-pointer overflow-hidden rounded-2xl">
                     <Link href={`/project/${item.slug || item.id}`}>
                         {/* [แก้ 4] ปรับสัดส่วนภาพให้เตี้ยลง (16/10 -> 16/9) และลดความโค้งมนเล็กน้อย (rounded-2xl) */}
                         <div className={`relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-lg transition-all duration-700 group-hover:shadow-xl group-hover:shadow-amber-500/20 bg-white border border-slate-200/50 group-hover:border-amber-400/50`}>
                             <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                             <div className={`absolute inset-0 bg-gradient-to-br ${isEven ? 'from-slate-50 to-slate-100' : 'from-white to-amber-50/30'} group-hover:opacity-80 transition-opacity duration-500`}></div>
                             {/* [แก้ 5] ลด padding ภายในรูปลง (p-8 -> p-6) */}
                             <div className="absolute inset-0 flex items-center justify-center p-6"><img src={item.image} alt={item.title} className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-700 ease-out" /></div>
                         </div>
                     </Link>
                 </div>

                 {/* Text Container */}
                 <div className="w-full md:w-1/2 text-center md:text-left">
                     {/* [แก้ 6] ลดขนาด Tag และ Padding */}
                     <span className="inline-block py-3 px-3.5 rounded-full bg-white border border-slate-200/50 text-[10px] md:text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3 shadow-sm leading-none hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-300">{item.category}</span>
                     
                     {/* [แก้ 7] ลดขนาด Font หัวข้อ (4xl -> 3xl) */}
                     <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-amber-700 transition-colors duration-300">{item.title}</h3>
                     
                     {/* [แก้ 8] ลดขนาด Font เนื้อหา (lg -> base) */}
                     <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-5 font-light">{item.shortDesc}</p>
                     
                     {/* [แก้ 9] ลดขนาดปุ่มอ่านรายละเอียด */}
                     <Link href={`/project/${item.slug || item.id}`} className="inline-flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wide group/btn hover:text-amber-600 transition-colors duration-300 text-xs md:text-sm">
                        <span>อ่านรายละเอียด</span>
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center group-hover/btn:bg-amber-500 group-hover/btn:text-white transition-all duration-300 transform group-hover/btn:translate-x-1">
                            <ArrowRight size={16} />
                        </div>
                     </Link>
                 </div>
               </motion.div>
             );
          })}
          </div>
        </div>
      </section>

      {/* VISION (9 ZEROS) */}
      <section id="vision" className="py-24 px-6 md:px-12 relative overflow-hidden bg-gradient-to-b from-[#dedee1] via-slate-50 to-white">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-white z-0 opacity-30"></div>
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-16">
                <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">Future Vision</span>
                <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mt-2 mb-6">วิสัยทัศน์ 9 ศูนย์</h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-teal-400 to-amber-400 mx-auto rounded-full mb-8"></div>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-sm sm:max-w-md md:max-w-2xl mx-auto font-light leading-relaxed">
                    เป้าหมายเพื่อขจัดความเหลื่อมล้ำและสร้างสังคมที่เป็นธรรม <br/>
                    ภายใต้วิสัยทัศน์ <span className="font-semibold text-slate-800">"Zero Inequality, Zero Poverty"</span>
                </p>
            </motion.div>

            <motion.div variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nineZeros.map((item) => {
                    const Icon = getIcon(item.icon); 
                    const isHovered = hoveredZero === item.id;
                    return (
                        <motion.div key={item.id} variants={itemPopup} onMouseEnter={() => setHoveredZero(item.id)} onMouseLeave={() => setHoveredZero(null)} 
                            onClick={() => {
                                console.log("Clicked item:", item.id, "with mechanisms:", item.details?.mechanisms?.length);
                                setSelectedZero(item);
                            }}
                            className={`group relative p-8 rounded-2xl cursor-pointer transition-all duration-300 ease-out border-2 
                            ${isHovered ? `bg-white ${item.activeBorder} shadow-xl -translate-y-2` : 'bg-white/60 backdrop-blur-md border-white/50 shadow-sm'}`}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isHovered ? `${item.activeBg} scale-110` : 'bg-slate-100'}`}>
                                    <Icon size={26} className={`transition-colors duration-300 ${isHovered ? item.activeColor : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-5xl font-bold transition-colors duration-300 font-mono tracking-tighter ${isHovered ? 'text-slate-100' : 'text-slate-200'}`}>0{item.id}</span>
                            </div>
                            
                            <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${isHovered ? 'text-slate-900' : 'text-slate-700'}`}>{item.title}</h3>
                            <h4 className={`text-sm font-semibold mb-4 transition-colors duration-300 ${isHovered ? item.activeColor : 'text-slate-500'}`}>{item.titleTh}</h4>
                            
                            <div className={`mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold inline-block ${isHovered ? `${item.activeBg} ${item.activeColor}` : 'bg-slate-100 text-slate-500'} transition-all duration-300`}>
                                {item.customStat}
                            </div>
                            
                            <div className="relative mt-5">
                                <p className={`text-slate-600 text-sm leading-relaxed font-light border-l-2 pl-3 transition-colors duration-300 ${isHovered ? item.activeBorder : 'border-slate-200'}`}>
                                    {item.goal}
                                </p>
                            </div>
                            <div className={`absolute bottom-4 right-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity ${item.activeColor}`}>คลิกดูรายละเอียด &rarr;</div>
                        </motion.div>
                    );
                })}
            </motion.div>
         </div>
         <AnimatePresence>{selectedZero && <ZeroDetailModal item={selectedZero} onClose={() => setSelectedZero(null)} />}</AnimatePresence>
      </section>

      <footer className={`py-12 text-center border-t border-slate-200 bg-white text-slate-500`}>
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
             <div className="w-12 h-1 bg-amber-500 rounded-full"></div>
             <p className="text-lg font-semibold text-slate-700">ขับเคลื่อนความเป็นธรรมไม่สิ้นสุด</p>
          </div>
          
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc3BXA48fPuLuhTLBKckmG3DG21AsFIrcb8ev3cyB3EgqZIEc4Be1hCRTLvcZ8_jQipeH1wOh_aq3K0_m5ONkC14GY8IuqBdfxRN9WtbZoYdzpM3eNlZaWnBJqw4nkD5WxnHdpYJeDgwTsELefWrwzjfmaho_NPyvVxfKPoJg7Lyuy0qu1CVNxqKnpFsTX/s0/hero-tawee.png" alt="Tawee Profile" className="w-24 h-24 object-contain mx-auto mb-6 opacity-100 grayscale" />
          
          {/* --- [ส่วนที่เพิ่มใหม่] Social Media Links --- */}
          <div className="flex items-center justify-center gap-6 mb-8">
              {/* Facebook */}
              <a href="https://www.facebook.com/TaweeSodsongOfficial" target="_blank" rel="noopener noreferrer" 
                 className="p-3 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 hover:-translate-y-1">
                 <Facebook size={20} />
              </a>

              {/* Instagram */}
              <a href="https://www.instagram.com/taweesodsongofficial" target="_blank" rel="noopener noreferrer" 
                 className="p-3 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:-translate-y-1">
                 <Instagram size={20} />
              </a>

              {/* X (Formerly Twitter) */}
              <a href="https://twitter.com/TaweeSodsong" target="_blank" rel="noopener noreferrer" 
                 // เปลี่ยนสี Hover เป็นสีดำ (bg-black) ให้ตรงกับ Brand X
                 className="p-3 rounded-full bg-slate-50 text-slate-400 hover:bg-black hover:text-white transition-all duration-300 hover:-translate-y-1 group">
                 
                 {/* ใช้ Custom SVG รูปตัว X แทรกเข้าไปตรงๆ */}
                 <svg 
                    viewBox="0 0 24 24" 
                    aria-hidden="true" 
                    className="w-5 h-5 fill-current" // ใช้ w-5 h-5 เท่ากับ size={20} ของเดิม
                 >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                 </svg>
              </a>
          </div>
          {/* ----------------------------------------- */}

          <p className="text-[10px] tracking-widest uppercase opacity-100 leading-relaxed">
            หัวหน้าพรรคประชาชาติ และสมาชิกสภาผู้แทนราษฎร แบบบัญชีรายชื่อ <br/> 
            Designed for Justice. © DEC 2025
          </p>
      </footer>
    </div>
  );
}