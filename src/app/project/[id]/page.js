"use client";
import { useEffect, useState, use } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Quote, PlayCircle, ArrowRight, FileQuestion, Home, Loader2, Share2 } from "lucide-react";
import { Kanit } from "next/font/google";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { projects } from "../../../data/projects";

const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

// --- Helper Functions ---
const convertToSeconds = (timeStr) => { if (!timeStr) return null; if (/^\d+$/.test(timeStr)) return timeStr; const match = timeStr.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/); if (match) { const h = parseInt(match[1] || 0, 10); const m = parseInt(match[2] || 0, 10); const s = parseInt(match[3] || 0, 10); return (h * 3600) + (m * 60) + s; } return null; };

// [UPDATED] YouTube URL Logic: เพิ่ม playsinline, rel, modestbranding
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
    
    // Config: playsinline=1 (มือถือไม่เต็มจอ), rel=0 (ไม่โชว์คลิปอื่น), modestbranding=1 (ลดโลโก้)
    let embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`; 
    
    const queryParams = []; 
    if (start) queryParams.push(`start=${start}`); 
    if (end) queryParams.push(`end=${end}`); 
    if (queryParams.length > 0) embedUrl += `&${queryParams.join('&')}`; 
    
    return embedUrl; 
};

// [NEW] Skeleton Loader Component (โหลดแบบกระพริบๆ)
const SkeletonLoader = () => (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8 pt-20 animate-pulse">
        {/* Hero Placeholder */}
        <div className="h-[50vh] bg-slate-200 rounded-3xl w-full"></div>
        
        {/* Title Placeholder */}
        <div className="space-y-4 max-w-3xl mx-auto">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-full"></div>
            <div className="h-6 bg-slate-200 rounded w-5/6"></div>
        </div>

        {/* Content Block Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);

// Gradient Divider Component
const GradientDivider = () => (
    <div className="w-full flex justify-center py-8">
        <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70"></div>
    </div>
);

// --- Dynamic Block ---
const DynamicBlock = ({ data }) => {
    const layout = data.layout || 'left'; 
    const hasMedia = !!data.mediaSrc && data.mediaSrc.trim() !== "" && data.mediaType !== 'none';

    const MediaContent = () => {
        if (!hasMedia) return null;
        let mediaEl = null;
        if (data.mediaType === 'video') {
            const embedUrl = getYouTubeEmbedUrl(data.mediaSrc);
            mediaEl = embedUrl ? (
                <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg group border border-slate-100">
                    <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
            ) : null;
        } else {
            const ImageElement = (
                <div className="relative group overflow-hidden rounded-xl shadow-lg w-full">
                    <img src={data.mediaSrc} alt="content" className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 ${data.actionUrl ? 'cursor-pointer' : ''}`} />
                    {data.actionUrl && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                เปิดลิงก์ ↗
                            </span>
                        </div>
                    )}
                </div>
            );
            mediaEl = data.actionUrl ? <Link href={data.actionUrl} target="_blank">{ImageElement}</Link> : ImageElement;
        }
        return (
            <div className="flex flex-col gap-2 w-full">
                {mediaEl}
                {data.caption && <p className="text-center text-xs text-slate-500 italic mt-1">{data.caption}</p>}
            </div>
        );
    };

    const TextContent = () => {
        const isQuote = data.textStyle === 'quote' || data.mediaType === 'quote';
        if (isQuote) {
            return (
                <div className="relative py-6 px-4 md:px-8 w-full">
                    <Quote size={28} className="text-amber-400 absolute top-0 left-0 opacity-60 transform scale-x-[-1]" />
                    <div className="relative z-10 px-2 my-2">
                        <div className="text-lg md:text-2xl font-medium text-slate-700 italic leading-relaxed text-center md:text-left" dangerouslySetInnerHTML={{ __html: data.content }} />
                    </div>
                    <Quote size={28} className="text-amber-400 absolute bottom-0 right-0 opacity-60" />
                    {data.caption && ( <div className="mt-4 flex justify-center md:justify-start items-center gap-3"><div className="h-px w-8 bg-amber-400"></div><p className="text-slate-500 font-bold text-xs tracking-wider uppercase">{data.caption}</p></div> )}
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-4 w-full">
                {data.heading && ( <h2 className="text-2xl md:text-3xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4 leading-tight">{data.heading}</h2> )}
                {data.content && ( <div className="text-base md:text-lg text-slate-600 leading-relaxed font-light whitespace-pre-line" dangerouslySetInnerHTML={{ __html: data.content }} /> )}
            </div>
        );
    };

    if (!hasMedia) {
        return ( <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-8 max-w-4xl mx-auto w-full">{TextContent()}</motion.div> );
    }
    if (layout === 'top' || layout === 'bottom' || layout === 'center') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="py-12 flex flex-col gap-8 max-w-4xl mx-auto w-full items-center">
                {(layout === 'top' || layout === 'center') && <div className="w-full max-w-4xl"><MediaContent /></div>}
                <div className="w-full">{TextContent()}</div>
                {layout === 'bottom' && <div className="w-full max-w-4xl"><MediaContent /></div>}
            </motion.div>
        );
    }
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className={`py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-6xl mx-auto ${layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2"><MediaContent /></div>
            <div className="w-full md:w-1/2">{TextContent()}</div>
        </motion.div>
    );
};

// --------------------------------------------------------
// Page Component
// --------------------------------------------------------
export default function ProjectDetail({ params }) {
  const unwrappedParams = use(params);
  const paramId = unwrappedParams.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation
  const { scrollY, scrollYProgress } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const fetchProject = async () => {
        try {
            let foundData = null;
            const q = query(collection(db, "projects"), where("slug", "==", paramId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                foundData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            } else {
                const docRef = doc(db, "projects", paramId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) foundData = { id: docSnap.id, ...docSnap.data() };
            }
            if (foundData && foundData.published === false) setProject(null);
            else setProject(foundData);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    if (paramId) fetchProject();
  }, [paramId]);

  // [UPDATED] Use Skeleton Loader
  if (loading) return (
    <div className={`min-h-screen bg-white ${kanit.className}`}>
        <SkeletonLoader />
    </div>
  );

  // [UPDATED] Beautiful 404
  if (!project) return (
    <div className={`h-screen flex flex-col items-center justify-center bg-slate-50 p-6 ${kanit.className}`}>
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileQuestion size={40} className="text-amber-500"/>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">ไม่พบเนื้อหา</h1>
            <p className="text-slate-500 mb-8 font-light">
                เนื้อหาที่คุณกำลังตามหาอาจถูกลบไปแล้ว <br/>หรือลิงก์ไม่ถูกต้อง
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Home size={18}/> กลับหน้าหลัก
            </Link>
        </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-white text-slate-800 ${kanit.className}`}>
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-amber-500 origin-left z-50" style={{ scaleX }} />
      
      {/* Navbar */}
      <nav className="fixed top-0 p-6 z-40 w-full flex justify-between">
          <Link href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow-md transition text-sm font-bold flex gap-2 items-center group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> กลับหน้าแรก
          </Link>
      </nav>

      {/* Hero */}
      <div className="relative h-[70vh] overflow-hidden bg-slate-900">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
             <img src={project.image} alt={project.title} className="w-full h-[120%] object-cover opacity-80" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        <div className="absolute bottom-0 w-full p-8 md:p-16 max-w-6xl mx-auto">
            <span className="bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded uppercase mb-4 inline-block shadow-lg">{project.category}</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight drop-shadow-sm">{project.title}</h1>
            <p className="text-slate-700 text-lg md:text-xl max-w-2xl font-light">{project.shortDesc}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20 pt-10">
        {project.contentBlocks && project.contentBlocks
            .filter(block => block.published !== false)
            .map((block, index) => (
            <div key={index}>
                <DynamicBlock data={block} />
                {block.hasDivider && <GradientDivider />}
            </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pb-20 border-t border-slate-100 pt-16 bg-slate-50/50">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="mb-8">
                    <img 
                        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc3BXA48fPuLuhTLBKckmG3DG21AsFIrcb8ev3cyB3EgqZIEc4Be1hCRTLvcZ8_jQipeH1wOh_aq3K0_m5ONkC14GY8IuqBdfxRN9WtbZoYdzpM3eNlZaWnBJqw4nkD5WxnHdpYJeDgwTsELefWrwzjfmaho_NPyvVxfKPoJg7Lyuy0qu1CVNxqKnpFsTX/s0/hero-tawee.png" 
                        alt="Profile" 
                        className="w-20 h-auto mx-auto object-contain drop-shadow-md"
                    />
                    <p className="font-bold text-slate-900 mt-3 text-lg">พ.ต.อ.ทวี สอดส่อง</p>
                    <p className="text-xs text-slate-500">ติดตามผลงานและการขับเคลื่อนนโยบาย</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <Link href="/" className="px-6 py-3 rounded-full border border-slate-300 text-slate-600 font-bold text-sm hover:bg-white hover:border-slate-400 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <ArrowLeft size={16}/> กลับหน้าหลัก
                    </Link>
                    
                    <button onClick={() => navigator.share({title: project.title, url: window.location.href})} className="px-6 py-3 rounded-full bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
                        <Share2 size={16}/> แชร์เรื่องราวนี้
                    </button>
                </div>
            </div>
      </div>
    </div>
  );
}