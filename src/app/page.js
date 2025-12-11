"use client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, ChevronDown, ChevronUp, X as CloseIcon, 
  ExternalLink, Facebook, Instagram,
  Circle, Star, Award, Shield, Users, Zap, Target, BookOpen, Heart, Globe,
  Badge, Search, HeartHandshake, Flag, Scale, Landmark,
  Quote, BarChart3, ArrowRight 
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

// Helper Icons
const getIconComponent = (iconName) => {
    const icons = { Circle, Star, Award, Shield, Users, Zap, Target, BookOpen, Heart, Globe, Badge, Search, HeartHandshake, Flag, Scale, Landmark };
    return icons[iconName] || Circle;
};

// --- Navbar ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
  
  const navLinks = [{ name: "หน้าแรก", target: "hero" }, { name: "เส้นทาง", target: "bio" }, { name: "ภารกิจ", target: "projects" }, { name: "วิสัยทัศน์", target: "vision" }];

  return (
    <>
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-6 left-0 right-0 z-[100] flex justify-center transition-all duration-500 pointer-events-none ${isMobileMenuOpen ? 'hidden' : ''}`}
        >
            <div className={`pointer-events-auto flex items-center gap-2 p-2 px-4 rounded-full transition-all duration-500 border border-white/20 backdrop-blur-md shadow-lg ${isScrolled ? 'bg-white/95 text-slate-800 shadow-xl' : 'bg-black/30 text-white hover:bg-black/40'}`}>
                <div 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`cursor-pointer font-bold tracking-tight uppercase flex gap-1.5 transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}
                >
                    <span>TAWEE</span>
                    <span className={isScrolled ? 'text-amber-600' : 'text-amber-400'}>SODSONG</span>
                </div>
                <div className={`w-px h-4 mx-2 ${isScrolled ? 'bg-slate-300' : 'bg-white/30'}`}></div>
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <button 
                            key={link.name} 
                            onClick={() => scrollToSection(link.target)} 
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${isScrolled ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/20 text-white/90 hover:text-white'}`}
                        >
                            {link.name}
                        </button>
                    ))}
                </div>
                <button className="md:hidden p-1 rounded-full hover:bg-white/10" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu size={20} />
                </button>
            </div>
        </motion.nav>
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={24} className="text-slate-800"/></button>
                    <div className="flex flex-col gap-8 text-center">
                        {navLinks.map((link) => (
                            <button key={link.name} onClick={() => scrollToSection(link.target)} className="text-2xl font-bold text-slate-800 hover:text-amber-600">{link.name}</button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
};

// Modal
const ZeroDetailModal = ({ item, onClose }) => {
    if (!item) return null;
    const Icon = getIcon(item.icon);
    const themeColor = item.activeColor || "text-slate-500"; 
    const themeBg = item.activeBg || "bg-slate-50";
    const themeBorder = item.activeBorder || "border-slate-200";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 shadow-2xl flex flex-col"
            >
                <div className={`p-6 md:p-8 ${themeBg} flex justify-between items-start sticky top-0 z-20 shrink-0 border-b ${themeBorder}`}>
                   <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm">
                           <Icon size={28} className={themeColor} />
                       </div>
                       <div>
                           <div className={`text-xs font-bold uppercase tracking-wider opacity-70 mb-1`}>Mission 0{item.id}</div>
                           <h3 className={`text-2xl font-bold ${themeColor} leading-none`}>{item.title}</h3>
                           <p className="text-sm font-medium text-slate-500 mt-1">{item.titleTh}</p>
                       </div>
                   </div>
                   <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 rounded-full transition-colors shadow-sm"><CloseIcon size={20} className="text-slate-400"/></button>
                </div>

                <div className="p-6 md:p-10 space-y-10 flex-1 overflow-y-auto">
                    <p className="text-l text-slate-800 leading-relaxed font-light">{item.details?.description}</p>

                    <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b-2 inline-block pb-1 ${themeBorder} ${themeColor}`}>กลไกสำคัญ (How)</h4>
                        <ul className="space-y-3 list-disc list-outside ml-5 text-slate-700">
                            {item?.details?.mechanisms?.map((mech, i) => (
                                <li key={i} className="pl-1 text-sm md:text-base leading-relaxed">
                                    {mech}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {item.details?.graphs && (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className="text-slate-400" size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600">ตัวชี้วัดความสำเร็จ</h4>
                            </div>
                            <div className="space-y-5">
                                {item.details.graphs.map((graph, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2 font-medium text-slate-700">
                                            <span>{graph.label}</span>
                                            <span>{graph.value}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
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
                            
                            {(item.details?.sourceUrl || item.details?.source) && (
                                <div className="mt-6 pt-4 border-t border-slate-200 text-right">
                                    {item.details.sourceUrl ? (
                                        <a href={item.details.sourceUrl} target="_blank" className="text-xs text-slate-400 hover:text-amber-600 flex items-center justify-end gap-1 transition-colors">
                                            {item.details.source || "อ้างอิงข้อมูล"} <ExternalLink size={10}/>
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">
                                            ที่มา: {item.details.source}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// --- Bio Section (UPDATED) ---
const BioSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <section id="bio" className="container mx-auto px-4 md:px-8 relative z-40 mb-20 mt-0 md:-mt-20 scroll-mt-24">
        <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            viewport={{ once: true }} 
            className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden max-w-4xl mx-auto"
        >
          {/* Header Box */}
          <div onClick={() => setIsOpen(!isOpen)} className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors gap-6 group">
            <div className="flex items-center gap-5 text-center md:text-left w-full md:w-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 mx-auto md:mx-0">
                    <UserIcon />
                </div>
                <div className="flex-1 text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">รู้จัก พ.ต.อ.ทวี สอดส่อง</h3>
                    <p className="text-sm md:text-base text-slate-500 font-light mt-1">เส้นทางชีวิตและความยุติธรรม</p>
                </div>
            </div>
            <div className={`hidden md:flex w-10 h-10 rounded-full border items-center justify-center transition-all ${isOpen ? 'bg-amber-500 border-amber-500 text-white rotate-180' : 'border-slate-200 text-slate-400 group-hover:border-amber-500 group-hover:text-amber-500'}`}>
                <ChevronDown size={20}/>
            </div>
            {/* Mobile Toggle Button (Visible underneath text on mobile) */}
            <div className={`md:hidden w-full py-2 flex items-center justify-center gap-2 text-sm font-medium rounded-xl transition-colors ${isOpen ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                {isOpen ? 'ซ่อนประวัติ' : 'ดูเส้นทางชีวิต'} <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: "circOut" }}>
                <div className="p-6 md:p-12 border-t border-slate-100 bg-slate-50/30">
                  
                  {/* Bio Intro Text */}
                  <div className="text-center max-w-2xl mx-auto mb-12 relative">
                      <h4 className="text-lg md:text-3xl font-bold text-slate-800 mb-4 leading-relaxed relative z-10">{bioIntro.headline}</h4>
                      <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full mb-6"></div>
                      <p className="text-slate-600 font-light leading-relaxed text-base md:text-lg mb-8 px-2">{bioIntro.philosophy}</p>
                      
                      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden mx-2 md:mx-0">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                          <p className="text-slate-800 font-bold text-base md:text-xl tracking-wide leading-relaxed whitespace-pre-line relative z-10 text-left pl-2">
                              {bioIntro.careerHighlight}
                          </p>
                      </div>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-0 relative pl-4 md:pl-0">
                      <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 md:-translate-x-1/2"></div>
                      
                      {bioTimeline.map((item, index) => {
                           const Icon = getIconComponent(item.icon);
                           const isEven = index % 2 === 0;
                           return (
                              <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center w-full mb-12 last:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                  <div className="absolute left-[5px] md:left-1/2 w-10 h-10 rounded-full bg-white border-4 border-amber-100 flex items-center justify-center z-10 -translate-x-1/2 md:-translate-x-1/2 shadow-sm text-amber-400">
                                      <Icon size={16} />
                                  </div>
                                  
                                  <div className="w-full md:w-1/2"></div>
                                  
                                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2 inline-block">{item.year}</span>
                                      <h5 className="font-bold text-lg text-slate-800 mb-2">{item.role}</h5>
                                      <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                                  </div>
                              </div>
                           )
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    );
};

const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

export default function Home() {
  const [hoveredZero, setHoveredZero] = useState(null);
  const [projectsData, setProjectsData] = useState(projects);
  const [selectedZero, setSelectedZero] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
    checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const q = query(collection(db, "projects"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const firebaseItems = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.published !== false) firebaseItems.push({ id: doc.id, ...data });
            });
            if (firebaseItems.length > 0) setProjectsData(firebaseItems);
        } catch (error) { console.error("Error:", error); }
    };
    fetchProjects();
  }, []);

  return (
    <div className={`min-h-screen bg-[#dedee1] ${kanit.className} text-slate-800 selection:bg-amber-100 selection:text-amber-900`}>
      <Navbar />
      
      {/* 1. HERO SECTION (NO SCROLL BUTTON) */}
      <section id="hero" className="relative flex items-center justify-center overflow-hidden min-h-[100dvh]"> 
        <div className="absolute inset-0 z-0">
            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbz5cKU4VE1GF2TrYueMnNje2npzzw109GnV7MuAX4zq71UEb2EShbQs-HZtMNoQSf51DtgSejfBCxzp8C6XjhaUVmQ0IfYmcsM5_yCqYv5qsTtGjWA7fVZsVr4n04J4vsOZ5Ioig18xgBgDm5W7cXuNCnCiEW2NC5o-EPhcdOkPjb2OPGGnyzYDQoY-W-/s0/bg-main.jpg" alt="Background" className="w-full h-full object-cover opacity-25 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#dedee1]/60 via-transparent to-[#dedee1]"></div>
        </div>
        
        <div className="relative z-10 w-full h-full flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-12 pt-10 md:pt-0 px-4 sm:px-6 md:px-12 lg:px-16 max-w-6xl mx-auto">
          {/* Text Side */}
          <div className="flex-1 relative flex flex-col items-center md:items-start justify-center z-20 text-center md:text-left min-w-0">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute -top-16 -left-16 md:-top-32 md:-left-12 w-[80vw] max-w-[400px] md:max-w-[600px] h-auto z-0 opacity-10 pointer-events-none">
                <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHsMQuM3GGn1po3jItyUcaLaAZ_pP7sFKDQJ7aXQXwGChsUXcRO8OC-NrEiQ9GFTGc3kDucu5gdBPv0W5UU9LzvIP7Nn0kokzTKAtsNKj7qJgyhgS1eTzk5hdHz1AoXVglJRrCZw_vM9FbR09Uh3EI96zXNUngNIBRfLpYQUHx22t938iqE65JToQQVvfB/s0/quote-shape.png" alt="Quote" className="w-full h-full object-contain transform -rotate-12" />
            </motion.div>
            
            <motion.div initial="hidden" animate="visible" transition={{ duration: 0.8 }} variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }} className="relative z-10 w-full flex flex-col items-center md:items-start">
                <div className="mb-7 md:mb-10 w-[300px] md:w-[380px] lg:w-[480px] shrink-0">
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQNWdzpwUeG8ZWHn2L6wIis_Mu4xZQuZ1aSTrtNRfbiKGDeTyc86pZCf2hbbWi1noBxwD52-nrAjtZ7KTwnYbLEcoKy2RqT2Gy0Jmm6XRsE9Stnz9ogReRIUIeabOhGoEl_5JHThoEF27rp2at-mwgOEJgpRQaUiBm8_MS7C4TBrnFM538yZUEpdTd9scB/s0/Name-sign.png" alt="Tawee Sodsong" className="w-full h-auto object-contain drop-shadow-sm" />
                </div>
                
                <motion.div initial={{ opacity: 0, y: 20, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.3 }} className="max-w-md px-2 md:px-0 md:pl-6 border-l-0 md:border-l-4 border-amber-600">
                    <blockquote className="text-base md:text-xl text-slate-700 font-medium italic leading-relaxed">
                        "พหุวัฒนธรรมคือ<span className="text-amber-700 font-bold">ความเสมอภาค...</span> <br/> ไม่ว่าคนเชื้อชาติไหน ศาสนาใด <br/> ต้องมีที่ยืนและมี<span className="text-amber-700 font-bold">ศักดิ์ศรีเท่าเทียมกัน</span>"
                    </blockquote>
                </motion.div>
            </motion.div>
          </div>

          {/* Image Side */}
          <motion.div initial="hidden" animate="visible" transition={{ duration: 0.8, delay: 0.2 }} variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }} className="flex-1 flex justify-end items-center relative z-30 min-w-0 pr-4 md:pr-0">
             <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative w-[260px] sm:w-[320px] md:w-[320px] lg:w-[420px] h-auto shrink-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-tr from-white to-slate-300 rounded-full blur-3xl opacity-50"></div>
                <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc3BXA48fPuLuhTLBKckmG3DG21AsFIrcb8ev3cyB3EgqZIEc4Be1hCRTLvcZ8_jQipeH1wOh_aq3K0_m5ONkC14GY8IuqBdfxRN9WtbZoYdzpM3eNlZaWnBJqw4nkD5WxnHdpYJeDgwTsELefWrwzjfmaho_NPyvVxfKPoJg7Lyuy0qu1CVNxqKnpFsTX/s0/hero-tawee.png" alt="Tawee" loading="eager" className="w-full h-auto object-contain drop-shadow-2xl relative z-10" />
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bio Section Place Here (Natural Flow - No Negative Margin) */}
      <BioSection />

      {/* 2. PROJECTS SECTION (Clean & Balanced) */}
      <section id="projects" className="py-20 px-6 md:px-12 bg-white relative z-10 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Key Missions</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">ภารกิจเพื่อประชาชน</h2>
          </div>
          <div className="grid gap-16 md:gap-20">
          {projectsData.map((item, index) => {
             const isEven = index % 2 === 0;
             return (
               <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, y: 40 }} 
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }} 
                   transition={{ duration: 0.6 }}
                   className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}
               >
                 <div className="w-full md:w-5/12 group cursor-pointer">
                     <Link href={`/project/${item.slug || item.id}`}>
                         <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl shadow-lg border border-slate-100">
                             <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                             <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                         </div>
                     </Link>
                 </div>
                 <div className="w-full md:w-7/12 flex flex-col items-start">
                     <span className="text-amber-600 text-[10px] font-bold tracking-widest uppercase mb-3 border border-amber-200 px-2 py-0.5 rounded bg-amber-50">{item.category}</span>
                     <Link href={`/project/${item.slug || item.id}`}>
                        <h3 className="text-xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight hover:text-amber-600 transition-colors">{item.title}</h3>
                     </Link>
                     <p className="text-slate-600 text-base leading-relaxed mb-6 font-light line-clamp-3">{item.shortDesc}</p>
                     <Link href={`/project/${item.slug || item.id}`} className="group flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-300 pb-0.5 hover:border-amber-500 hover:text-amber-600 transition-all">
                        อ่านเพิ่มเติม <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                     </Link>
                 </div>
               </motion.div>
             );
          })}
          </div>
        </div>
      </section>

      {/* 3. VISION (9 ZEROS) */}
      <section id="vision" className="py-24 px-6 md:px-12 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#dedee1]">
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-16">
                <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">Future Vision</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2 mb-6">วิสัยทัศน์ 9 ศูนย์</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-amber-400 mx-auto rounded-full mb-6"></div>
                <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed px-2">
                    เป้าหมายเพื่อขจัดความเหลื่อมล้ำ<br className="block sm:hidden" />
                    และสร้างสังคมที่เป็นธรรม<br />
                    ภายใต้วิสัยทัศน์ <span className="font-semibold text-slate-800">"Zero Inequality, Zero Poverty"</span>
                </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nineZeros.map((item) => {
                    const Icon = getIcon(item.icon); 
                    const isHovered = hoveredZero === item.id || isMobile;
                    return (
                        <motion.div key={item.id} onMouseEnter={() => setHoveredZero(item.id)} onMouseLeave={() => setHoveredZero(null)} 
                            onClick={() => setSelectedZero(item)}
                            className={`group relative p-8 rounded-2xl cursor-pointer transition-all duration-300 ease-out border 
                            ${isHovered ? `bg-white ${item.activeBorder} shadow-xl -translate-y-2` : 'bg-white/60 backdrop-blur-md border-white/50 shadow-sm'}`}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isHovered ? `${item.activeBg} scale-110` : 'bg-slate-100'}`}>
                                    <Icon size={24} className={`transition-colors duration-300 ${isHovered ? item.activeColor : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-4xl font-bold font-mono transition-colors duration-300 tracking-tighter ${isHovered ? 'text-slate-100' : 'text-slate-200'}`}>0{item.id}</span>
                            </div>
                            
                            <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${isHovered ? 'text-slate-900' : 'text-slate-700'}`}>{item.title}</h3>
                            <h4 className={`text-xs font-semibold mb-4 transition-colors duration-300 ${isHovered ? item.activeColor : 'text-slate-500'}`}>{item.titleTh}</h4>
                            
                            <div className={`mt-2 py-1 px-1.5 rounded text-[10px] font-bold inline-block ${isHovered ? `${item.activeBg} ${item.activeColor}` : 'bg-slate-100 text-slate-500'} transition-all duration-300`}>
                                {item.customStat}
                            </div>
                            
                            <div className="relative mt-5 pt-4 border-t border-slate-100">
                                <p className={`text-slate-600 text-sm leading-relaxed font-light transition-colors duration-300`}>
                                    {item.goal}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
         </div>
         <AnimatePresence>{selectedZero && <ZeroDetailModal item={selectedZero} onClose={() => setSelectedZero(null)} />}</AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 text-center">
          <div className="flex flex-col items-center justify-center mb-8">
             <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc3BXA48fPuLuhTLBKckmG3DG21AsFIrcb8ev3cyB3EgqZIEc4Be1hCRTLvcZ8_jQipeH1wOh_aq3K0_m5ONkC14GY8IuqBdfxRN9WtbZoYdzpM3eNlZaWnBJqw4nkD5WxnHdpYJeDgwTsELefWrwzjfmaho_NPyvVxfKPoJg7Lyuy0qu1CVNxqKnpFsTX/s0/hero-tawee.png" alt="Tawee Profile" className="w-20 h-20 object-contain mx-auto mb-6 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
             
             <div className="flex gap-6 mb-6">
                  <a href="https://www.facebook.com/TaweeSodsongOfficial" target="_blank" className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook size={18} /></a>
                  <a href="https://www.instagram.com/taweesodsongofficial" target="_blank" className="text-slate-400 hover:text-pink-600 transition-colors"><Instagram size={18} /></a>
                  <a href="https://twitter.com/TaweeSodsong" target="_blank" className="text-slate-400 hover:text-black transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                  </a>
             </div>
             
             <div className="space-y-1">
                <p className="text-slate-800 font-bold text-sm tracking-wide">พ.ต.อ.ทวี สอดส่อง</p>
                <p className="text-slate-500 text-xs font-light">หัวหน้าพรรคประชาชาติ และสมาชิกสภาผู้แทนราษฎร</p>
                <p className="text-slate-400 text-[10px] tracking-widest uppercase font-medium pt-4 opacity-50">Designed for Justice © 2025</p>
             </div>
          </div>
      </footer>
    </div>
  );
}