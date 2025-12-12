"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase"; // ⚠️ เช็ค path ../../lib/firebase ให้ถูกกับโครงสร้างโฟลเดอร์คุณ
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query, writeBatch, where } from "firebase/firestore"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Kanit } from "next/font/google";
import { 
  Pencil, Trash2, LogOut, PlusCircle, 
  Image as ImageIcon, Video, Quote,
  ArrowUp, ArrowDown, Save, ChevronUp, ChevronDown, Plus, X, Check, RefreshCw, 
  Link as LinkIcon, Wand2, Eye, EyeOff,
  LayoutTemplate, Bold, Italic, Layers, Settings, ExternalLink, Minus
} from "lucide-react";

const kanit = Kanit({ subsets: ["thai"], weight: ["300", "400", "500", "600"] });

// --- Custom Layout Icons ---
const IconPicLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
    <rect x="3" y="4" width="8" height="16" rx="2" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
    <path d="M14 6H21 M14 10H21 M14 14H19" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconPicTop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
    <rect x="4" y="3" width="16" height="10" rx="2" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
    <path d="M4 17H20 M4 21H16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconPicRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
    <rect x="13" y="4" width="8" height="16" rx="2" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
    <path d="M3 6H10 M3 10H10 M3 14H8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // --- Main State ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [order, setOrder] = useState(0); 
  const [isPublished, setIsPublished] = useState(true);

  // --- Category State ---
  const [categories, setCategories] = useState(["Human Rights", "Economic Justice", "Law Enforcement", "Land Rights"]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); 
  const [tempEditValue, setTempEditValue] = useState(""); 

  // --- Data & Loading ---
  const [blocks, setBlocks] = useState([]); 
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setIsAuthorized(true); fetchProjects(); } 
      else { router.push("/login"); }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProjects = async () => {
    try {
        const q = query(collection(db, "projects"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const items = [];
        const foundCategories = new Set(categories); 
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ id: doc.id, ...data });
            if(data.category) foundCategories.add(data.category);
        });
        setProjectsList(items);
        setCategories(Array.from(foundCategories));
        
        if (!editId) {
             const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
             setOrder(maxOrder + 1);
        }
    } catch (error) { console.error("Error:", error); }
  };

  const generateSlug = () => {
      if (!title) { alert("กรุณากรอกชื่อโครงการก่อนครับ"); return; }
      let newSlug = title.toString().toLowerCase().trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') // เอาเฉพาะอังกฤษและตัวเลข
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');

      if (!newSlug || newSlug.length < 3) {
          const randomId = Math.floor(Math.random() * 1000);
          const year = new Date().getFullYear();
          newSlug = `project-${year}-${randomId}`;
      }
      setSlug(newSlug);
  };

  const normalizeBlock = (block) => {
      return {
          layout: block.layout || 'left', 
          heading: block.heading || "", 
          content: block.content || "", 
          textStyle: block.textStyle || (block.mediaType === 'quote' ? 'quote' : 'normal'),
          mediaType: (block.mediaType === 'quote' ? 'none' : block.mediaType) || 'image',
          mediaSrc: block.mediaSrc || "", 
          caption: block.caption || "", 
          actionUrl: block.actionUrl || "",
          published: block.published !== false,
          hasDivider: block.hasDivider || false
      };
  };

  const addBlock = () => { setBlocks([...blocks, normalizeBlock({ layout: 'left', mediaType: 'image' })]); };
  const updateBlock = (index, field, value) => { const newBlocks = [...blocks]; newBlocks[index][field] = value; setBlocks(newBlocks); };
  const removeBlock = (index) => { if(confirm("ลบ Block นี้?")) setBlocks(blocks.filter((_, i) => i !== index)); };
  
  const moveBlock = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const target = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const insertHtmlTag = (index, tagType) => {
      const textarea = document.getElementById(`editor-${index}`);
      if (!textarea) return;
      const start = textarea.selectionStart; const end = textarea.selectionEnd;
      const text = blocks[index].content || "";
      const selectedText = text.substring(start, end);
      let insertion = "";
      if (tagType === 'bold') insertion = `<b>${selectedText || 'ตัวหนา'}</b>`;
      else if (tagType === 'italic') insertion = `<i>${selectedText || 'ตัวเอียง'}</i>`;
      else if (tagType === 'link') { const url = prompt("ใส่ URL:", "https://"); if(url) insertion = `<a href="${url}" target="_blank" class="text-amber-600 underline">${selectedText || 'ลิงก์'}</a>`; else return; }
      updateBlock(index, 'content', text.substring(0, start) + insertion + text.substring(end));
  };

  const handleAddCategory = () => { if (newCategory.trim() && !categories.includes(newCategory.trim())) { setCategories([...categories, newCategory.trim()]); setNewCategory(""); }};
  const handleRemoveCategory = (cat) => { if (confirm(`ลบหมวดหมู่ "${cat}"?`)) setCategories(categories.filter(c => c !== cat)); };
  const startEditCategory = (cat) => { setEditingCategory(cat); setTempEditValue(cat); };
  const saveEditCategory = async () => {
      if (!tempEditValue.trim() || tempEditValue === editingCategory) { setEditingCategory(null); return; }
      const oldName = editingCategory; const newName = tempEditValue.trim();
      if (!confirm(`เปลี่ยนชื่อ "${oldName}" เป็น "${newName}" ในทุกโปรเจกต์?`)) return;
      setLoading(true);
      try {
          const q = query(collection(db, "projects"), where("category", "==", oldName));
          const querySnapshot = await getDocs(q);
          const batch = writeBatch(db);
          querySnapshot.forEach((doc) => { batch.update(doc.ref, { category: newName }); });
          await batch.commit();
          setCategories(categories.map(c => c === oldName ? newName : c));
          if (category === oldName) setCategory(newName);
          fetchProjects();
      } catch (error) { console.error(error); } finally { setLoading(false); setEditingCategory(null); }
  };

  const handleReorderProject = async (index, direction, e) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return; if (direction === 'down' && index === projectsList.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = projectsList[index]; const targetItem = projectsList[targetIndex];
    try { 
        const batch = writeBatch(db); 
        batch.update(doc(db, "projects", currentItem.id), { order: targetItem.order }); 
        batch.update(doc(db, "projects", targetItem.id), { order: currentItem.order }); 
        await batch.commit(); fetchProjects(); 
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const rawPayload = { title, slug: slug || "", category, shortDesc, image: coverImage, order: Number(order) || 0, published: isPublished, contentBlocks: blocks, updatedAt: new Date() };
    try {
      if (editId) { await updateDoc(doc(db, "projects", editId), rawPayload); alert("บันทึกแล้ว!"); } 
      else { await addDoc(collection(db, "projects"), { ...rawPayload, createdAt: new Date() }); alert("สร้างใหม่แล้ว!"); }
      resetForm(); fetchProjects();
    } catch (error) { console.error(error); alert("Error: " + error.message); } finally { setLoading(false); }
  };

  const handleEditClick = (item) => {
      setEditId(item.id); setTitle(item.title); setSlug(item.slug || ""); 
      setCategory(item.category); setShortDesc(item.shortDesc); setCoverImage(item.image);
      setOrder(item.order || 0); setIsPublished(item.published !== false);
      setBlocks((item.contentBlocks || []).map(normalizeBlock));
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const handleDeleteProject = async (id) => { if(!confirm("ยืนยันลบ?")) return; await deleteDoc(doc(db, "projects", id)); if(editId === id) resetForm(); fetchProjects(); }
  const resetForm = () => { setEditId(null); setTitle(""); setSlug(""); setCategory(""); setShortDesc(""); setCoverImage(""); setOrder(projectsList.length > 0 ? Math.max(...projectsList.map(i => i.order || 0)) + 1 : 1); setBlocks([]); setIsPublished(true); }

  if (!isAuthorized) return null;

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-800 ${kanit.className} flex flex-col md:flex-row`}>
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 overflow-y-auto flex flex-col z-20 shadow-xl">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
             <h1 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={18}/> Admin</h1>
             <button onClick={() => {signOut(auth); router.push("/login");}} className="text-red-500 bg-red-50 p-1.5 rounded"><LogOut size={16}/></button>
        </div>
        <div className="p-4 border-b border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Layers size={10}/> หมวดหมู่</h3>
            <div className="flex gap-1 mb-2">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="เพิ่ม..." className="flex-1 text-xs p-1.5 border rounded"/>
                <button onClick={handleAddCategory} className="bg-slate-800 text-white px-2 rounded text-xs"><Plus size={14}/></button>
            </div>
            <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                    <div key={cat} className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${editingCategory===cat ? 'bg-amber-100 border-amber-300' : 'bg-slate-50'}`}>
                        {editingCategory === cat ? (
                            <>
                                <input value={tempEditValue} onChange={e => setTempEditValue(e.target.value)} className="w-16 bg-transparent outline-none" autoFocus/>
                                <button onClick={saveEditCategory} className="text-green-600 font-bold">✓</button>
                                <button onClick={() => setEditingCategory(null)} className="text-red-500">✕</button>
                            </>
                        ) : (
                            <>
                                <span onClick={() => setCategory(cat)} className="cursor-pointer">{cat}</span>
                                <button onClick={() => startEditCategory(cat)} className="text-slate-400 hover:text-amber-500"><Pencil size={8}/></button>
                                <button onClick={() => handleRemoveCategory(cat)} className="text-slate-400 hover:text-red-500"><X size={8}/></button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
        <div className="flex-1 p-4 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Projects ({projectsList.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {projectsList.map((item, idx) => (
                    <div key={item.id} onClick={() => handleEditClick(item)} className={`p-2 rounded border flex gap-2 items-center cursor-pointer hover:bg-slate-50 group ${editId === item.id ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-100 bg-white'}`}>
                        <div className="flex flex-col gap-0.5 opacity-50 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                            <button onClick={e => handleReorderProject(idx, 'up', e)} disabled={idx===0} className="hover:text-amber-600 disabled:opacity-20"><ChevronUp size={12}/></button>
                            <button onClick={e => handleReorderProject(idx, 'down', e)} disabled={idx===projectsList.length-1} className="hover:text-amber-600 disabled:opacity-20"><ChevronDown size={12}/></button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs truncate">{item.title}</div>
                            <div className="flex gap-2 text-[9px] text-slate-400"><span>{item.category}</span><span className={item.published ? 'text-green-500' : 'text-slate-300'}>{item.published ? 'Live' : 'Draft'}</span></div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(item.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- MAIN CANVAS --- */}
      <div className="flex-1 p-4 md:p-8 h-screen overflow-y-auto bg-slate-100">
        <div className="max-w-4xl mx-auto pb-20">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-bold flex items-center gap-2 ${editId ? 'text-amber-600' : 'text-slate-800'}`}>
                            {editId ? <><Pencil size={24}/> กำลังแก้ไข</> : <><PlusCircle size={24}/> สร้างใหม่</>}
                        </h2>
                        {editId && (
                            <button onClick={resetForm} className="group flex items-center gap-1 text-xs font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <X size={14} className="group-hover:rotate-90 transition-transform"/> ยกเลิก
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-1">Order: <span className="font-mono font-bold">{order}</span></p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button type="button" onClick={() => setIsPublished(!isPublished)} className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-bold border ${isPublished ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                        {isPublished ? <><Eye size={14}/> Live</> : <><EyeOff size={14}/> Hidden</>}
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className={`flex-1 md:flex-none px-6 py-2 rounded text-white font-bold text-sm shadow flex items-center justify-center gap-2 ${editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'}`}>
                        <Save size={16}/> {loading ? 'Saving...' : (editId ? 'บันทึก' : 'สร้างใหม่')}
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 mb-6">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-lg font-bold border-b border-slate-200 focus:border-slate-800 outline-none py-1" placeholder="ชื่อโครงการ..."/>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center gap-2">
                        <LinkIcon size={12} className="text-slate-400"/>
                        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="bg-transparent text-xs w-full outline-none" placeholder="url-slug"/>
                        <button onClick={generateSlug} type="button" className="text-xs text-blue-500 hover:bg-blue-100 p-1 rounded"><Wand2 size={12}/></button>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={12} className="text-slate-400"/>
                            <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="bg-transparent text-xs w-full outline-none" placeholder="Cover Image URL"/>
                        </div>
                        {coverImage && (
                            <div className="relative w-full h-24 rounded overflow-hidden border border-slate-200 mt-2 group">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 text-xs border rounded bg-slate-50"><option value="">- Category -</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <input type="text" value={shortDesc} onChange={e => setShortDesc(e.target.value)} className="w-full p-2 text-xs border rounded bg-slate-50" placeholder="Description..."/>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-wider"><LayoutTemplate size={14}/> Content Blocks</div>
                {blocks.map((block, index) => (
                    <div key={index} className={`relative bg-white rounded-lg border-2 transition-all ${block.published ? 'border-slate-200 shadow-sm' : 'border-dashed border-slate-300 opacity-70'}`}>
                        <div className="flex justify-between items-center p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-0.5 px-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                                    <button onClick={() => moveBlock(index, 'up')}><ChevronUp size={12}/></button>
                                    <button onClick={() => moveBlock(index, 'down')}><ChevronDown size={12}/></button>
                                </div>
                                <span className="text-xs font-bold text-slate-400">#{index+1}</span>
                                <div className="h-4 w-px bg-slate-300 mx-1"></div>
                                <div className="flex bg-white rounded border border-slate-200 p-0.5 gap-0.5">
                                    <button type="button" onClick={() => updateBlock(index, 'layout', 'left')} className={`p-1.5 rounded ${block.layout === 'left' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}><IconPicLeft /></button>
                                    <button type="button" onClick={() => updateBlock(index, 'layout', 'top')} className={`p-1.5 rounded ${block.layout === 'top' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}><IconPicTop /></button>
                                    <button type="button" onClick={() => updateBlock(index, 'layout', 'right')} className={`p-1.5 rounded ${block.layout === 'right' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}><IconPicRight /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateBlock(index, 'published', !block.published)} className={`text-xs flex items-center gap-1 font-bold ${block.published ? 'text-green-500' : 'text-slate-400'}`}>{block.published ? <Eye size={12}/> : <EyeOff size={12}/>}</button>
                                <button onClick={() => removeBlock(index)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                            </div>
                        </div>

                        <div className={`p-4 flex gap-4 ${block.layout === 'top' ? 'flex-col' : (block.layout === 'right' ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row')}`}>
                            <div className={`flex flex-col gap-2 ${block.layout === 'top' ? 'w-full' : 'w-full md:w-5/12'}`}>
                                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                    <div className="flex gap-2 mb-2 text-[9px] uppercase font-bold text-slate-400 justify-between">
                                        <div>
                                            <button onClick={() => updateBlock(index, 'mediaType', 'image')} className={`mr-2 ${block.mediaType==='image'?'text-slate-900 underline':'hover:text-slate-600'}`}>Image</button>
                                            <button onClick={() => updateBlock(index, 'mediaType', 'video')} className={`mr-2 ${block.mediaType==='video'?'text-slate-900 underline':'hover:text-slate-600'}`}>Video</button>
                                            <button onClick={() => updateBlock(index, 'mediaType', 'none')} className={block.mediaType==='none'?'text-red-500 underline':'hover:text-slate-600'}>None</button>
                                        </div>
                                    </div>
                                    {block.mediaType !== 'none' && (
                                        <>
                                            {block.mediaSrc ? ( <div className="relative group"><img src={block.mediaSrc} className="w-full h-32 object-cover rounded bg-white border mb-2" alt="preview"/></div> ) : ( <div className="w-full h-32 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs mb-2">No Image</div> )}
                                            <input type="text" value={block.mediaSrc || ""} onChange={e => updateBlock(index, 'mediaSrc', e.target.value)} className="w-full p-1.5 text-xs border rounded mb-1" placeholder="URL..."/>
                                            <input type="text" value={block.caption || ""} onChange={e => updateBlock(index, 'caption', e.target.value)} className="w-full p-1.5 text-xs border-b bg-transparent outline-none text-center placeholder:text-slate-300" placeholder="Caption..."/>
                                            <div className="mt-2 pt-2 border-t flex items-center gap-1">
                                                <ExternalLink size={10} className="text-slate-400"/>
                                                <input type="text" value={block.actionUrl || ""} onChange={e => updateBlock(index, 'actionUrl', e.target.value)} className="flex-1 p-1 text-[10px] border rounded text-blue-600" placeholder="Action URL (Optional)"/>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between">
                                    {block.textStyle !== 'quote' && <input type="text" value={block.heading || ""} onChange={e => updateBlock(index, 'heading', e.target.value)} className="font-bold text-sm bg-transparent outline-none placeholder:text-slate-300 w-2/3" placeholder="Heading (Optional)..."/>}
                                    <button onClick={() => updateBlock(index, 'textStyle', block.textStyle === 'quote' ? 'normal' : 'quote')} className={`text-[10px] border px-2 rounded ml-auto ${block.textStyle === 'quote' ? 'bg-amber-100 text-amber-700 border-amber-300 font-bold' : 'bg-slate-50 text-slate-500'}`}>
                                        {block.textStyle === 'quote' ? 'Format: Quote' : 'Format: Normal'}
                                    </button>
                                </div>
                                <div className="relative group flex-1">
                                    <div className="absolute top-0 right-0 flex bg-white border shadow-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => insertHtmlTag(index, 'bold')} className="p-1 hover:bg-slate-100"><Bold size={12}/></button>
                                        <button onClick={() => insertHtmlTag(index, 'italic')} className="p-1 hover:bg-slate-100"><Italic size={12}/></button>
                                        <button onClick={() => insertHtmlTag(index, 'link')} className="p-1 hover:bg-slate-100"><LinkIcon size={12}/></button>
                                    </div>
                                    <textarea id={`editor-${index}`} value={block.content || ""} onChange={e => updateBlock(index, 'content', e.target.value)} rows={5} className={`w-full p-2 text-sm border rounded resize-none outline-none focus:border-slate-400 ${block.textStyle === 'quote' ? 'text-center italic font-medium text-amber-900 bg-amber-50/50' : 'text-slate-600'}`} placeholder={block.textStyle === 'quote' ? '"Write your quote here..."' : "Paragraph Content..."} />
                                    {block.textStyle === 'quote' && ( <input type="text" value={block.caption || ""} onChange={e => updateBlock(index, 'caption', e.target.value)} className="w-full mt-2 p-1.5 text-xs text-center border-b border-amber-300 bg-amber-50 text-amber-800 placeholder:text-amber-800/50 outline-none font-bold" placeholder="— Author Name"/> )}
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 p-2 flex justify-center bg-slate-50/30 rounded-b-lg">
                            <button type="button" onClick={() => updateBlock(index, 'hasDivider', !block.hasDivider)} className={`text-[10px] px-3 py-1 rounded-full flex items-center gap-1 transition-all border ${block.hasDivider ? 'bg-slate-800 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                                {block.hasDivider ? <><Minus size={12} className="rotate-90"/> Divider ON</> : <><Plus size={10}/> Add Divider</>}
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={addBlock} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 font-bold hover:bg-white hover:border-slate-400 hover:text-slate-600 transition-all flex flex-col items-center gap-1"><PlusCircle size={24}/><span>Add Block</span></button>
            </div>
        </div>
      </div>
    </div>
  );
}