"use client";
// --------------------------------------------------------
// ส่วนที่ 1: Imports
// --------------------------------------------------------
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Quote, PlayCircle } from "lucide-react";
import { Kanit } from "next/font/google";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { projects } from "../../../data/projects";

// ตั้งค่าฟอนต์
const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

// --------------------------------------------------------
// ส่วนที่ 2: Helper Functions (แปลงเวลา / แปลงลิงก์ YouTube)
// --------------------------------------------------------
const convertToSeconds = (timeStr) => {
  if (!timeStr) return null;
  if (/^\d+$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (match) {
    const h = parseInt(match[1] || 0, 10);
    const m = parseInt(match[2] || 0, 10);
    const s = parseInt(match[3] || 0, 10);
    return (h * 3600) + (m * 60) + s;
  }
  return null;
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = cleanUrl.match(regExp);
  const videoId = (match && match[1]) ? match[1] : null;

  if (!videoId) return null;

  let start = null;
  let end = null;
  try {
    const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    const params = urlObj.searchParams;
    const timeParam = params.get('t') || params.get('start');
    if (timeParam) start = convertToSeconds(timeParam);
    const endParam = params.get('end');
    if (endParam) end = convertToSeconds(endParam);
  } catch (e) {}

  let embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const queryParams = [];
  if (start) queryParams.push(`start=${start}`);
  if (end) queryParams.push(`end=${end}`);
  if (queryParams.length > 0) embedUrl += `?${queryParams.join('&')}`;

  return embedUrl;
};

// --------------------------------------------------------
// ส่วนที่ 3: Component ย่อย (ZigzagSection)
// --------------------------------------------------------
const ZigzagSection = ({ data, isEven }) => {
    const TextContent = (
        <div className="flex flex-col gap-4">
            {data.heading && (
                <h2 className="text-xl md:text-3xl font-bold text-slate-900 leading-snug border-l-4 border-amber-500 pl-4 break-words">
                    {data.heading}
                </h2>
            )}
            {data.content && (
                <div className="text-base md:text-lg text-slate-700 leading-relaxed font-light whitespace-pre-wrap break-words">
                    {data.content}
                </div>
            )}
        </div>
    );

    let MediaContent = null;
    
    if (data.mediaType === 'image' && data.mediaSrc) {
        MediaContent = (
            <div className="flex flex-col items-center w-full">
                <div className="rounded-2xl overflow-hidden shadow-lg bg-slate-100 relative group w-full border border-slate-100">
                    <img src={data.mediaSrc} alt="Content" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                {data.caption && <p className="text-center text-slate-500 text-xs md:text-sm mt-2 italic bg-slate-50 py-1.5 px-3 rounded-lg inline-block">{data.caption}</p>}
            </div>
        );
    } else if (data.mediaType === 'video' && data.mediaSrc) {
        const embedUrl = getYouTubeEmbedUrl(data.mediaSrc);
        if (embedUrl) {
            MediaContent = (
                <div className="w-full">
                    <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-2xl bg-black">
                        <iframe src={embedUrl} title="Video" className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen></iframe>
                    </div>
                    {data.caption && (
                        <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 text-sm">
                            <PlayCircle size={16} className="text-red-500"/><span className="italic">{data.caption}</span>
                        </div>
                    )}
                </div>
            );
        } else {
            MediaContent = <div className="p-4 bg-red-50 text-red-500 text-xs rounded border border-red-200">ลิงก์วิดีโอไม่ถูกต้อง</div>;
        }
    } else if (data.mediaType === 'quote' && data.mediaSrc) {
        MediaContent = (
            <div className="relative pl-10 md:pl-12 pr-6 py-6 border-l-[6px] border-amber-500 bg-gradient-to-r from-amber-50 to-transparent rounded-r-xl w-full">
                <Quote className="absolute top-6 left-3 text-amber-400 opacity-50 transform -scale-x-100" size={24} />
                <p className="text-lg md:text-2xl font-medium text-slate-800 leading-relaxed relative z-10 break-words">"{data.mediaSrc}"</p>
                {data.caption && (
                    <div className="mt-3 flex items-center gap-3 relative z-10">
                        <div className="h-px w-10 bg-amber-400"></div>
                        <p className="text-amber-700 font-bold text-xs uppercase tracking-wider">{data.caption}</p>
                    </div>
                )}
            </div>
        );
    }

    if (!MediaContent) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
                className="py-8 border-b border-slate-200 last:border-0"
            >
                {TextContent}
            </motion.div>
        );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8 md:gap-12 py-10 border-b border-slate-200 last:border-0`}
      >
        <div className="w-full md:w-1/2">{MediaContent}</div>
        <div className="w-full md:w-1/2">{TextContent}</div>
      </motion.div>
    );
};

// --------------------------------------------------------
// ส่วนที่ 4: Page Component หลัก
// --------------------------------------------------------
export default function ProjectDetail({ params }) {
  // [FIX] ใช้ use() เพื่อรองรับ Next.js 15/16
  const unwrappedParams = use(params);
  const paramId = unwrappedParams.id;
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
        try {
        // สร้างตัวแปรมารับข้อมูลก่อน ยังไม่ setProject ทันที
        let foundData = null;

        // 1. ลองค้นหาจาก Slug
        const q = query(collection(db, "projects"), where("slug", "==", paramId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            foundData = { id: docData.id, ...docData.data() };
        } else {
            // 2. ถ้าไม่เจอ Slug ลองค้นหาจาก ID
            const docRef = doc(db, "projects", paramId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                foundData = { id: docSnap.id, ...docSnap.data() };
            } else {
                // 3. ถ้าไม่เจอทั้งคู่ ลองหาจากข้อมูล Static (ถ้ามี)
                const staticProject = projects.find(p => p.id.toString() === paramId.toString());
                if (staticProject) foundData = staticProject;
            }
        }

        // [สำคัญ] เช็คตรงนี้: ถ้าเจอข้อมูล แต่สถานะ published เป็น false (Draft) ให้ถือว่าไม่เจอ
        if (foundData && foundData.published === false) {
             console.log("Project is Draft (Hidden). Access Denied.");
             setProject(null); // จะทำให้ไปแสดงหน้า 404 ด้านล่าง
        } else {
             setProject(foundData);
        }

      } catch (error) { 
            console.error("Error fetching project:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    if (paramId) fetchProject();
  }, [paramId]);

  if (loading) return (
    <div className={`h-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 ${kanit.className}`}>
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm tracking-wide font-medium animate-pulse">กำลังโหลดเนื้อหา...</span>
        </div>
    </div>
  );

  if (!project) return (
    <div className={`h-screen flex items-center justify-center bg-[#dedee1] text-slate-500 ${kanit.className}`}>
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-md mx-4">
            <h1 className="text-6xl font-bold mb-4 text-slate-200">404</h1>
            <p className="text-lg text-slate-700 font-medium mb-6">ไม่พบข้อมูลโปรเจกต์นี้</p>
            <p className="text-xs text-slate-400 mb-6">รหัสอ้างอิง: {paramId}</p>
            <Link href="/" className="inline-block px-8 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors shadow-lg hover:shadow-amber-500/30">
                กลับหน้าหลัก
            </Link>
        </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-800 ${kanit.className} selection:bg-amber-500 selection:text-white`}>
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 z-50 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-amber-700 transition-colors group px-3 py-2 rounded-lg hover:bg-slate-50">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-wide">Back to Home</span>
        </Link>
        <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-500 border border-slate-300 px-4 py-1.5 rounded-full bg-slate-50">
            {project.category || "Mission"}
        </span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pt-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="rounded-[2rem] overflow-hidden shadow-2xl h-[50vh] md:h-[65vh] relative group bg-slate-200">
            <img src={project.image || "/images/hero/bg-main.jpg"} alt={project.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 text-white">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                    <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-md mb-4 shadow-lg">
                        {project.category}
                    </span>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg mb-4 md:mb-6 max-w-4xl break-words">
                        {project.title}
                    </h1>
                    <p className="text-white/90 text-sm md:text-lg font-light max-w-3xl border-l-4 border-amber-500 pl-4 md:pl-6 leading-relaxed bg-black/20 backdrop-blur-sm py-2 pr-4 rounded-r-lg break-words">
                        {project.shortDesc}
                    </p>
                </motion.div>
            </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="max-w-5xl mx-auto px-6 py-10 md:py-20">
        <div className="flex items-center gap-4 mb-8 md:mb-10 pb-4 border-b border-slate-200">
            <div className="h-10 md:h-12 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
            <h3 className="text-xl md:text-3xl font-bold text-slate-900 m-0 break-words leading-tight">
                {project.contentTitle || "รายละเอียดและผลการดำเนินงาน"}
            </h3>
        </div>
        
        <div className="prose prose-lg prose-slate mx-auto max-w-none">
            {project.contentBlocks && project.contentBlocks.length > 0 ? (
                project.contentBlocks
                    .filter(block => block.published !== false) // แสดงเฉพาะ published blocks (default true)
                    .map((block, index) => {
                    if (block.mediaType || block.heading || block.content) {
                        return <ZigzagSection key={index} data={block} isEven={index % 2 === 0} />;
                    }
                    return null;
                })
            ) : (
                <div className="space-y-8 text-lg leading-relaxed text-slate-600 font-light text-center py-10 opacity-60">
                    ...อยู่ระหว่างการอัปเดตข้อมูล...
                </div>
            )}
        </div>

        <div className="mt-16 md:mt-24 pt-10 border-t border-slate-200 flex flex-col items-center text-center space-y-4 md:space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-200 rounded-full border-4 border-[#f8fafc]"></div>
            <motion.img 
                initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }} 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc3BXA48fPuLuhTLBKckmG3DG21AsFIrcb8ev3cyB3EgqZIEc4Be1hCRTLvcZ8_jQipeH1wOh_aq3K0_m5ONkC14GY8IuqBdfxRN9WtbZoYdzpM3eNlZaWnBJqw4nkD5WxnHdpYJeDgwTsELefWrwzjfmaho_NPyvVxfKPoJg7Lyuy0qu1CVNxqKnpFsTX/s0/hero-tawee.png" 
                alt="Tawee Profile" className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-2xl -mt-1" 
            />
            <div>
                <p className="text-slate-900 font-bold text-xl md:text-2xl">พ.ต.อ.ทวี สอดส่อง</p>
                <p className="text-slate-500 text-sm md:text-base tracking-wide mt-1">ขับเคลื่อนนโยบายเพื่อประชาชน</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}