// src/app/HomeClient.js
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, ChevronDown, ChevronUp, X as CloseIcon, 
  ExternalLink, Facebook, Instagram,
  Circle, Star, Award, Shield, Users, Zap, Target, BookOpen, Heart, Globe,
  Badge, Search, HeartHandshake, Flag, Scale, Landmark,
  BarChart3, ArrowRight, Loader2 // เพิ่ม Loader2
} from "lucide-react";
import { Kanit } from "next/font/google";
import Link from "next/link";
import Image from "next/image"; 
import { useEffect, useState, memo, useCallback } from 'react'; 

// --- 1. เพิ่ม IMPORTS ของ Firebase และ AuthContext ---
import { collection, getDocs, query } from "firebase/firestore"; 
import { db } from "../lib/firebase"; 
import { useAuth } from "../context/AuthContext";
// --------------------------------------------------

import { nineZeros, getIcon } from "../data/nineZeros"; 
import { bioIntro, bioTimeline } from "../data/bioData"; 

const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

// --- Helper Components ---
const getIconComponent = (iconName) => {
    const icons = { Circle, Star, Award, Shield, Users, Zap, Target, BookOpen, Heart, Globe, Badge, Search, HeartHandshake, Flag, Scale, Landmark };
    return icons[iconName] || Circle;
};

const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

const ProjectCard = memo(({ item, isEven }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.6 }}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center will-change-transform-opacity`}
        >
            <div className="w-full md:w-5/12 group cursor-pointer">
                <Link href={`/project/${item.slug || item.id}`}>
                    <div className="relative w-full aspect-16/10 overflow-hidden rounded-2xl shadow-lg border border-slate-100">
                        {item.image ? (
                            <Image 
                                src={item.image} 
                                alt={item.title || "Project"} 
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                                loading="lazy"
                            />
                        ) : <div className="w-full h-full bg-slate-200" />}
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
});

const ZeroCard = memo(({ item, isHovered, onMouseEnter, onMouseLeave, onClick }) => {
    const Icon = getIcon(item.icon);
    return (
        <motion.div 
            onMouseEnter={() => onMouseEnter(item.id)} 
            onMouseLeave={onMouseLeave} 
            onClick={() => onClick(item)}
            className={`group relative p-8 rounded-2xl cursor-pointer transition-all duration-300 ease-out border will-change-transform-opacity
            ${isHovered ? `bg-white ${item.activeBorder} shadow-xl -translate-y-2` : 'bg-white/60 backdrop-blur-md border-white/50 shadow-sm'}`}
        >
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
});

const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
        const checkScroll = window.scrollY > 50;
        if (checkScroll !== isScrolled) setIsScrolled(checkScroll);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

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
            className={`fixed top-6 left-0 right-0 z-100 flex justify-center transition-all duration-500 pointer-events-none ${isMobileMenuOpen ? 'hidden' : ''}`}
        >
            <div className={`pointer-events-auto flex items-center gap-2 p-2 px-4 rounded-full transition-all duration-500 border border-white/20 backdrop-blur-md shadow-lg ${isScrolled ? 'bg-white/95 text-slate-800 shadow-xl' : 'bg-black/30 text-white hover:bg-black/40'}`}>
                <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`cursor-pointer font-bold tracking-tight uppercase flex gap-1.5 transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                    <span>TAWEE</span><span className={isScrolled ? 'text-amber-600' : 'text-amber-400'}>SODSONG</span>
                </div>
                <div className={`w-px h-4 mx-2 ${isScrolled ? 'bg-slate-300' : 'bg-white/30'}`}></div>
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <button key={link.name} onClick={() => scrollToSection(link.target)} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${isScrolled ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/20 text-white/90 hover:text-white'}`}>
                            {link.name}
                        </button>
                    ))}
                </div>
                <button aria-label="Open Menu" className="md:hidden p-1 rounded-full hover:bg-white/10" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu size={20} />
                </button>
            </div>
        </motion.nav>
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-110 bg-white flex flex-col items-center justify-center will-change-transform-opacity">
                    <button aria-label="Close Menu" onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={24} className="text-slate-800"/></button>
                    <div className="flex flex-col gap-8 text-center">
                        {navLinks.map((link) => ( <button key={link.name} onClick={() => scrollToSection(link.target)} className="text-2xl font-bold text-slate-800 hover:text-amber-600">{link.name}</button> ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
});

const ZeroDetailModal = memo(({ item, onClose }) => {
    if (!item) return null;
    const Icon = getIcon(item.icon);
    const themeColor = item.activeColor || "text-slate-500"; 
    const themeBg = item.activeBg || "bg-slate-50";
    const themeBorder = item.activeBorder || "border-slate-200";
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm will-change-transform-opacity" onClick={onClose}></motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 shadow-2xl flex flex-col will-change-transform-opacity"
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
                            {item?.details?.mechanisms?.map((mech, i) => ( <li key={i} className="pl-1 text-sm md:text-base leading-relaxed">{mech}</li> ))}
                        </ul>
                    </div>
                    {item.details?.graphs && (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-slate-400" size={18} />
            {/* แก้ไขบรรทัดข้างล่างนี้ครับ */}
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                {item.details.graphTitle || "สถิติจริง และเป้าหมายการแก้ปัญหา"}
            </h4>
        </div>
                            <div className="space-y-5">
                                {item.details.graphs.map((graph, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2 font-medium text-slate-700"><span>{graph.label}</span><span>{graph.value}</span></div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: graph.percent / 100 }} transition={{ duration: 1, delay: 0.2 }} style={{ transformOrigin: 'left' }} className={`h-full rounded-full ${graph.color} will-change-transform-opacity`}></motion.div></div>
                                    </div>
                                ))}
                            </div>
                            {(item.details?.sourceUrl || item.details?.source) && (
                                <div className="mt-6 pt-4 border-t border-slate-200 text-right">
                                    {item.details.sourceUrl ? ( <a href={item.details.sourceUrl} target="_blank" className="text-xs text-slate-400 hover:text-amber-600 flex items-center justify-end gap-1 transition-colors">{item.details.source || "อ้างอิงข้อมูล"} <ExternalLink size={10}/></a> ) : ( <span className="text-xs text-slate-400 italic">ที่มา: {item.details.source}</span> )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
});

// --- Modal สำหรับแสดงข้อมูล Bio Timeline (ตัวใหม่) ---
const BioTimelineModal = memo(({ item, onClose }) => {
    if (!item) return null;
    const Icon = getIconComponent(item.icon);
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl flex flex-col will-change-transform-opacity"
            >
                {/* ส่วนหัว Modal */}
                <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm text-amber-500 border border-slate-100">
                           <Icon size={24} />
                       </div>
                       <div>
                           <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">{item.year}</div>
                           <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.role}</h3>
                       </div>
                   </div>
                   <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 rounded-full transition-colors shadow-sm border border-slate-100"><CloseIcon size={18} className="text-slate-400"/></button>
                </div>
                {/* ส่วนเนื้อหา Modal */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh]">
                    <p className="text-slate-600 leading-relaxed font-light whitespace-pre-line text-sm md:text-base">
                        {item.fullDesc}
                    </p>
                </div>
            </motion.div>
        </div>
    );
});

const BioSection = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTimeline, setSelectedTimeline] = useState(null); // เพิ่ม State ควบคุม Popup

    return (
      <section id="bio" className="container mx-auto px-4 md:px-8 relative z-40 mt-16 md:-mt-12 scroll-mt-24">
        <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
          
          <div onClick={() => setIsOpen(!isOpen)} className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors gap-6 group">
            <div className="flex items-center gap-5 text-center md:text-left w-full md:w-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 mx-auto md:mx-0"><UserIcon /></div>
                <div className="flex-1 text-left"><h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">รู้จัก พ.ต.อ.ทวี สอดส่อง</h3><p className="text-sm md:text-base text-slate-500 font-light mt-1">เส้นทางชีวิตและความยุติธรรม</p></div>
            </div>
            <div className={`hidden md:flex w-10 h-10 rounded-full border items-center justify-center transition-all ${isOpen ? 'bg-amber-500 border-amber-500 text-white rotate-180' : 'border-slate-200 text-slate-400 group-hover:border-amber-500 group-hover:text-amber-500'}`}><ChevronDown size={20}/></div>
            <div className={`md:hidden w-full py-2 flex items-center justify-center gap-2 text-sm font-medium rounded-xl transition-colors ${isOpen ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>{isOpen ? 'ซ่อนประวัติ' : 'ดูเส้นทางชีวิต'} <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/></div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ maxHeight: 0, opacity: 0 }} animate={{ maxHeight: 2000, opacity: 1 }} exit={{ maxHeight: 0, opacity: 0 }} transition={{ duration: 0.5, ease: "circOut" }}>
                <div className="p-6 md:p-12 border-t border-slate-100 bg-slate-50/30">
                  <div className="text-center max-w-2xl mx-auto mb-12 relative">
                      <h4 className="text-lg md:text-3xl font-bold text-slate-800 mb-4 leading-relaxed relative z-10">{bioIntro.headline}</h4>
                      <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full mb-6"></div>
                      <p className="text-slate-600 font-light leading-relaxed text-base md:text-lg mb-8 px-2">{bioIntro.philosophy}</p>
                      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden mx-2 md:mx-0">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                          <p className="text-slate-800 font-bold text-base md:text-xl tracking-wide leading-relaxed whitespace-pre-line relative z-10 text-left pl-2">{bioIntro.careerHighlight}</p>
                      </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="max-w-3xl mx-auto space-y-0 relative pl-4 md:pl-0">
                      <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 md:-translate-x-1/2"></div>
                      {bioTimeline.map((item, index) => {
                           const Icon = getIconComponent(item.icon);
                           const isEven = index % 2 === 0;
                           return (
                              <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center w-full mb-10 last:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                  <div className="absolute left-[5px] md:left-1/2 w-10 h-10 rounded-full bg-white border-4 border-amber-100 flex items-center justify-center z-10 -translate-x-1/2 md:-translate-x-1/2 shadow-sm text-amber-500"><Icon size={16} /></div>
                                  <div className="w-full md:w-1/2"></div>
                                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2 inline-block border border-amber-100">{item.year}</span>
                                      <h5 className="font-bold text-lg text-slate-800 mb-1">{item.role}</h5>
                                      <p className="text-sm text-slate-500 font-light leading-relaxed mb-3">{item.desc}</p>
                                      
                                      {/* ปุ่มกดอ่านเพิ่มเติม เปิด Popup */}
                                      <button 
                                        onClick={() => setSelectedTimeline(item)} 
                                        className="text-[11px] font-bold text-slate-400 hover:text-amber-600 border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1 shadow-sm"
                                      >
                                          อ่านเพิ่มเติม <ArrowRight size={10} />
                                      </button>
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

        {/* 🌟 แสดง Popup เมื่อมีการคลิก */}
        <AnimatePresence>
            {selectedTimeline && <BioTimelineModal item={selectedTimeline} onClose={() => setSelectedTimeline(null)} />}
        </AnimatePresence>

      </section>
    );
});

export default function HomeClient({ initialProjects }) {
  // 1. วางตรงนี้เลยครับ (บรรทัดที่ 281)
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  
  // --- 2. เรียกใช้ AuthContext ---
  const { user } = useAuth(); 
  // ------------------------------
  
  const [hoveredZero, setHoveredZero] = useState(null);
  const [projectsData, setProjectsData] = useState(initialProjects || []);
  const [selectedZero, setSelectedZero] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // --- 3. เพิ่ม State สำหรับ Loading ---
  const [loadingProjects, setLoadingProjects] = useState(!initialProjects); 

  useEffect(() => {
    const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
    checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- 4. เพิ่ม useEffect เพื่อดึงข้อมูล Projects เมื่อ Login แล้ว ---
  useEffect(() => {
    // ถ้ามี User และยังไม่มีข้อมูล (หรือข้อมูลว่างเปล่า) ให้ทำการ Fetch
    if (user && projectsData.length === 0) {
        setLoadingProjects(true);
        const fetchProjects = async () => {
            try {
                const q = query(collection(db, "projects")); 
                const querySnapshot = await getDocs(q);
                
                const data = querySnapshot.docs
                .map((doc) => {
                    const docData = doc.data();
                    return { 
                    id: doc.id, 
                    ...docData,
                    // แปลง Timestamp เป็น String
                    createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : null,
                    updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate().toISOString() : null,
                    order: typeof docData.order === 'number' ? docData.order : 999 
                    };
                })
                .filter((item) => item.published !== false)
                .sort((a, b) => a.order - b.order); // เรียงลำดับ
                
                setProjectsData(data);
            } catch (error) {
                console.error("Error fetching projects client-side:", error);
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchProjects();
    }
  }, [user, projectsData.length]);
  // -------------------------------------------------------------

  const handleMouseEnter = useCallback((id) => setHoveredZero(id), []);
  const handleMouseLeave = useCallback(() => setHoveredZero(null), []);
  const handleZeroClick = useCallback((item) => setSelectedZero(item), []);

  return (
    <div className={`min-h-screen bg-[#dedee1] ${kanit.className} text-slate-800 selection:bg-amber-100 selection:text-amber-900`}>
      <Navbar />
      
      {/* 🌟 โซนพื้นหลังมืด (Hero + Bio ซ้อนกันอยู่) เข้มสุดๆ ด้วยสีดำ #020202 */}
      <div className="relative w-full bg-[#020202] pb-16 md:pb-24">
        
        {/* 1. HERO SECTION (Immersive Full Screen) */}
        {/* บังคับ min-h-[100dvh] เพื่อดัน BioSection ให้ตกขอบจอพอดี 100% ในมือถือ */}
        <section id="hero" className="relative flex flex-col md:block overflow-hidden min-h-dvh"> 
          
          {/* --- A. ภาพพื้นหลังสำหรับ Desktop (จอใหญ่) --- */}
          <div className="hidden md:block absolute inset-0 z-0">
              <Image 
                  src="/images/hero/bg-hero.jpg" 
                  alt="Background" 
                  fill
                  priority
                  quality={100}
                  // 🌟 ขยับภาพขึ้นนิดนึงโดยแก้พิกัด Y จาก center เป็น 60% (ดันจุดโฟกัสลง ทำให้ภาพขยับขึ้น)
                  className="object-cover object-[80%_60%] opacity-100" 
              />
              {/* Gradient 1 (ซ้ายไปขวา) */}
              <div className="absolute inset-0 bg-linear-to-r from-[#020202] via-[#020202]/60 to-transparent"></div>
              
              {/* Gradient 2 (ล่างขึ้นบน) */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#020202] to-transparent"></div>
          </div>

          {/* --- B. ภาพพื้นหลังสำหรับ Mobile (จอมือถือ - แบ่งครึ่งบน) --- */}
          {/* 🌟 ซูมภาพ 115% ดึงไปทางขวาเพื่อลดพื้นที่มืดฝั่งซ้าย และทำให้ท่านทวีใหญ่ขึ้น */}
          <div className="relative w-full h-[55vh] md:hidden z-0 overflow-hidden">
              <Image 
                  src="/images/hero/bg-hero.jpg" 
                  alt="Background" 
                  fill
                  priority
                  className="object-cover object-[85%_20%] scale-[1.15] origin-right opacity-100" 
              />
              {/* ไล่สีดำเฉพาะขอบล่างของภาพ เพื่อเชื่อมกับพื้นดำของตัวหนังสือให้เนียนตา */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#020202] via-[#020202]/90 to-transparent"></div>
          </div>

          {/* --- C. กล่องเนื้อหาข้อความ --- */}
          {/* บังคับ min-h-[100dvh] ในโหมดคอมเพื่อให้จัดให้อยู่ตรงกลางได้พอดี */}
          <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto flex-1 flex flex-col justify-center pb-12 md:pb-0 md:min-h-dvh">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              transition={{ duration: 1, ease: "easeOut" }} 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} 
              // 🌟 md:mt-32 ดันข้อความลงมาด้านล่างในหน้าจอคอม
              className="max-w-full sm:max-w-xl md:max-w-xl lg:max-w-2xl flex flex-col items-start md:mt-32"
            >
              {/* Name Sign - 🌟 ย่อขนาดลงใน PC เพื่อให้ภาพเด่นขึ้น ไม่แย่งซีน */}
              <div className="mb-6 md:mb-8 w-60 sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[460px] shrink-0">
                  <img 
                    src="/images/hero/name-sign.png" 
                    alt="Tawee Sodsong" 
                    className="w-full h-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" 
                  />
              </div>

              {/* Quote Block - 🌟 ย่อขนาด Text ลงใน PC */}
              <motion.div 
                initial={{ opacity: 0, filter: "blur(5px)" }} 
                animate={{ opacity: 1, filter: "blur(0px)" }} 
                transition={{ duration: 1, delay: 0.4 }} 
                className="pl-4 md:pl-5 border-l-2 md:border-l-4 border-amber-500"
              >
                  <blockquote className="text-[17px] sm:text-lg md:text-[20px] lg:text-[24px] text-slate-100 font-medium italic leading-relaxed drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                      "พหุวัฒนธรรมคือ<span className="text-amber-400 font-bold">ความเสมอภาค...</span> <br /> 
                      ไม่ว่าคนเชื้อชาติไหน ศาสนาใด <br /> 
                      ต้องมีที่ยืนและมี<span className="text-amber-400 font-bold">ศักดิ์ศรีเท่าเทียมกัน</span>"
                  </blockquote>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Bio Section */}
        <BioSection />
        
      </div>

      {/* 2. PROJECTS SECTION */}
      <section id="projects" className="py-20 px-6 md:px-12 bg-white relative z-10 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] scroll-mt-20 -mt-10 md:-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16"><span className="text-amber-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Key Missions</span><h2 className="text-3xl md:text-5xl font-bold text-slate-900">ภารกิจเพื่อประชาชน</h2></div>
          
          {/* แสดง Loader หรือ ข้อมูล */}
          {loadingProjects ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-amber-500" size={48} />
                  <p className="text-slate-400 font-light">กำลังโหลดข้อมูลภารกิจ...</p>
              </div>
          ) : (
              <div className="grid gap-16 md:gap-20">
                {projectsData.length > 0 ? (
                    projectsData.map((item, index) => ( <ProjectCard key={item.id} item={item} isEven={index % 2 === 0} /> ))
                ) : (
                    <div className="text-center py-10 text-slate-400">ไม่พบข้อมูลโครงการ</div>
                )}
              </div>
          )}
        </div>
      </section>

      {/* 3. VISION */}
      <section id="vision" className="py-24 px-6 md:px-12 relative overflow-hidden bg-linear-to-b from-white via-slate-50 to-[#dedee1]">
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-16">
                <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">Future Vision</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2 mb-6">วิสัยทัศน์</h2>
                <div className="w-16 h-1 bg-linear-to-r from-teal-400 to-amber-400 mx-auto rounded-full mb-6"></div>
                
                {/* 🌈 แก้ไขข้อความตกบรรทัดในมือถือ */}
                <p 
                    className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed px-2"
                    style={{ textWrap: 'balance' }} 
                >
                    เป้าหมายเพื่อขจัดความเหลื่อมล้ำและสร้างสังคมที่เป็นธรรม<br />
                    ภายใต้วิสัยทัศน์ <span className="font-semibold text-slate-800 inline-block">"Zero Inequality, Zero Poverty"</span>
                </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nineZeros.map((item) => ( <ZeroCard key={item.id} item={item} isHovered={hoveredZero === item.id || isMobile} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleZeroClick} /> ))}
            </motion.div>
         </div>
         <AnimatePresence>{selectedZero && <ZeroDetailModal item={selectedZero} onClose={() => setSelectedZero(null)} />}</AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 text-center">
          <div className="flex flex-col items-center justify-center mb-8">
             <div className="relative w-20 h-20 mx-auto mb-6">
                 <Image src="/images/hero/hero-tawee.png" alt="Tawee Profile" fill sizes="80px" className="object-contain opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
             </div>
             <div className="flex gap-6 mb-6">
                  <a href="https://www.facebook.com/TaweeSodsongOfficial" target="_blank" className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook size={18} /></a>
                  <a href="https://www.instagram.com/taweesodsongofficial" target="_blank" className="text-slate-400 hover:text-pink-600 transition-colors"><Instagram size={18} /></a>
                  <a href="https://twitter.com/TaweeSodsong" target="_blank" className="text-slate-400 hover:text-black transition-colors"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></a>
             </div>
             <div className="space-y-1">
                 <p className="font-bold text-slate-900 mt-3 text-lg">พ.ต.อ.ทวี สอดส่อง</p>
                    <p className="text-xs text-slate-500">หัวหน้าพรรคประชาชาติ และอดีตรัฐมนตรีว่าการกระทรวงยุติธรรม</p>
                 <div className="pt-4 flex flex-col items-center gap-2">
                     <button 
                         onClick={() => setIsTermsOpen(true)}
                         className="text-[10px] text-amber-600 hover:underline font-bold uppercase tracking-widest cursor-pointer transition-colors"
                     >
                         Terms of Use
                     </button>
                     <p className="text-slate-400 text-[10px] tracking-widest uppercase font-medium opacity-50">
                         © {currentYear} Pol.Col. Tawee Sodsong. All rights reserved.
                     </p>
                 </div>
             </div>
          </div>
      </footer>
      <AnimatePresence>
        {isTermsOpen && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsTermsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg p-8 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-slate-900">ข้อกำหนดการใช้งาน (Terms of Use)</h3>
                <button onClick={() => setIsTermsOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed font-light">
                <p className="font-bold text-slate-800">1. วัตถุประสงค์</p>
                <p>เว็บไซต์นี้เป็นแพลตฟอร์มอย่างเป็นทางการในการนำเสนอผลงาน และนโยบายของ พ.ต.อ.ทวี สอดส่อง เพื่อสร้างความเข้าใจที่ถูกต้องแก่สาธารณชน</p>
                <p className="font-bold text-slate-800">2. ลิขสิทธิ์และทรัพย์สินทางปัญญา</p>
                <p>เนื้อหา ภาพถ่าย และวิดีโอทั้งหมดเป็นลิขสิทธิ์ของทีมงาน พ.ต.อ.ทวี สอดส่อง ห้ามนำไปใช้ในเชิงพาณิชย์หรือดัดแปลงโดยไม่ได้รับอนุญาต</p>
                <p className="font-bold text-slate-800">3. การคุ้มครองข้อมูล</p>
                <p>ข้อมูลที่แสดงผลเป็นข้อมูล ณ วันที่เผยแพร่ ทีมงานขอสงวนสิทธิ์ในการปรับปรุงเนื้อหาให้สอดคล้องกับสถานการณ์ปัจจุบันโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
              </div>
              <button onClick={() => setIsTermsOpen(false)} className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                รับทราบและปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}