"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query, writeBatch, where } from "firebase/firestore"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Kanit } from "next/font/google";
import { 
  Pencil, Trash2, LogOut, PlusCircle, 
  Image as ImageIcon, Video, Quote,
  ArrowUp, ArrowDown, Save, ChevronUp, ChevronDown, Plus, X, Check, RefreshCw, Link as LinkIcon, Wand2
} from "lucide-react";

const kanit = Kanit({ subsets: ["thai"], weight: ["300", "400", "600"] });

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // State หลัก
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [order, setOrder] = useState(0); 
  const [contentTitle, setContentTitle] = useState(""); 
  
  // State จัดการหมวดหมู่
  const [categories, setCategories] = useState(["Human Rights", "Economic Justice", "Law Enforcement", "Land Rights"]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); 
  const [tempEditValue, setTempEditValue] = useState(""); 

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

        if (!editId && items.length > 0) {
            const maxOrder = Math.max(...items.map(i => i.order || 0));
            setOrder(maxOrder + 1);
        }
    } catch (error) { console.error("Error:", error); }
  };

  // --- Functions จัดการหมวดหมู่ ---
  const handleAddCategory = () => {
      if (newCategory.trim() && !categories.includes(newCategory.trim())) {
          setCategories([...categories, newCategory.trim()]);
          setNewCategory("");
      }
  };

  const handleRemoveCategory = (catToRemove) => {
      if (confirm(`ต้องการลบหมวดหมู่ "${catToRemove}" หรือไม่?`)) {
          setCategories(categories.filter(cat => cat !== catToRemove));
          if (category === catToRemove) setCategory("");
      }
  };

  const startEditCategory = (cat) => { setEditingCategory(cat); setTempEditValue(cat); };
  const cancelEditCategory = () => { setEditingCategory(null); setTempEditValue(""); };

  const saveEditCategory = async () => {
      if (!tempEditValue.trim() || tempEditValue === editingCategory) { cancelEditCategory(); return; }
      if (categories.includes(tempEditValue)) { alert("ชื่อหมวดหมู่นี้มีอยู่แล้ว"); return; }
      const oldName = editingCategory;
      const newName = tempEditValue.trim();
      if (!confirm(`เปลี่ยนชื่อหมวดหมู่จาก "${oldName}" เป็น "${newName}"?`)) return;
      setLoading(true);
      try {
          const q = query(collection(db, "projects"), where("category", "==", oldName));
          const querySnapshot = await getDocs(q);
          const batch = writeBatch(db);
          querySnapshot.forEach((doc) => { batch.update(doc.ref, { category: newName }); });
          await batch.commit();
          const newCategories = categories.map(cat => cat === oldName ? newName : cat);
          setCategories(newCategories);
          if (category === oldName) setCategory(newName);
          fetchProjects(); 
      } catch (error) { console.error(error); } finally { setLoading(false); cancelEditCategory(); }
  };

  // --- Helper: Generate Slug ---
  const generateSlug = () => {
      if (!title) return;
      const newSlug = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '');
      setSlug(newSlug);
  }

  // --- Block Logic ---
  const addBlock = () => setBlocks([...blocks, { heading: "", content: "", mediaType: "none", mediaSrc: "", caption: "", published: true }]);
  const updateBlock = (index, field, value) => { const newBlocks = [...blocks]; newBlocks[index][field] = value; setBlocks(newBlocks); };
  const removeBlock = (index) => { if(!confirm("ลบส่วนเนื้อหานี้?")) return; setBlocks(blocks.filter((_, i) => i !== index)); };
  const moveBlock = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const target = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // --- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const rawPayload = {
        title, 
        slug: slug || "", 
        category, shortDesc, image: coverImage, 
        order: Number(order) || 0, 
        contentTitle: contentTitle || "", 
        contentBlocks: blocks, updatedAt: new Date(),
    };
    const payload = JSON.parse(JSON.stringify(rawPayload));

    try {
      if (editId) {
        await updateDoc(doc(db, "projects", editId), payload);
        alert("บันทึกเรียบร้อย!");
      } else {
        await addDoc(collection(db, "projects"), { ...payload, createdAt: new Date() });
        alert("สร้างโครงการเรียบร้อย!");
      }
      resetForm(); fetchProjects();
    } catch (error) { console.error(error); alert("เกิดข้อผิดพลาด: " + error.message); } 
    finally { setLoading(false); }
  };

  // --- Handle Delete & Reorder ---
  const handleDelete = async (id) => {
      if(!confirm("ยืนยันการลบ?")) return;
      try { await deleteDoc(doc(db, "projects", id)); if (editId === id) resetForm(); fetchProjects(); } catch (error) { console.error(error); }
  }
  const handleReorderProject = async (index, direction, e) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return; if (direction === 'down' && index === projectsList.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = projectsList[index]; const targetItem = projectsList[targetIndex];
    try { const batch = writeBatch(db); batch.update(doc(db, "projects", currentItem.id), { order: targetItem.order }); batch.update(doc(db, "projects", targetItem.id), { order: currentItem.order }); await batch.commit(); fetchProjects(); } catch (error) { console.error(error); }
  };

  // --- Handle Edit Click ---
  const handleEditClick = (item) => {
      setEditId(item.id); setTitle(item.title); 
      setSlug(item.slug || ""); 
      setCategory(item.category); setShortDesc(item.shortDesc); setCoverImage(item.image);
      setOrder(item.order || 0); setContentTitle(item.contentTitle || "");
      if (item.contentBlocks && Array.isArray(item.contentBlocks)) setBlocks(item.contentBlocks); else setBlocks([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const resetForm = () => {
      setEditId(null); setTitle(""); setSlug(""); setCategory(""); setShortDesc(""); setCoverImage(""); 
      const maxOrder = projectsList.length > 0 ? Math.max(...projectsList.map(i => i.order || 0)) : 0;
      setOrder(maxOrder + 1); setContentTitle(""); setBlocks([]);
  }

  const handleLogout = () => { signOut(auth); router.push("/login"); }

  if (!isAuthorized) return null;

  return (
    <div className={`min-h-screen bg-slate-100 p-6 md:p-10 text-slate-800 ${kanit.className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Admin Panel</h1>
            <div className="flex gap-2"><button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded transition border border-red-200"><LogOut size={16}/> ออกจากระบบ</button></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-7">
                <div className={`bg-white p-6 rounded-xl shadow-lg border transition-colors ${editId ? 'border-amber-400' : 'border-slate-200'}`}>
                    <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 pb-4 border-b ${editId ? 'text-amber-600' : 'text-teal-600'}`}>
                        {editId ? <><Pencil size={20}/> กำลังแก้ไข (ID: {order})</> : <><PlusCircle size={20}/> สร้าง Content ใหม่</>}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                             {/* [NEW] Title + Slug Section */}
                             <div className="col-span-2 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ชื่อโครงการ (Title)</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border border-slate-300 rounded text-lg font-bold" placeholder="เช่น โครงการแก้หนี้สิน..." />
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <label className="text-xs font-bold text-blue-800 uppercase block mb-1 flex items-center gap-1">
                                        <LinkIcon size={12}/> ลิงก์ภาษาอังกฤษ (Slug) *สำคัญ
                                    </label>
                                    <div className="flex gap-2">
                                        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 p-2 border border-blue-200 rounded text-sm text-blue-900 font-mono placeholder:text-blue-300" placeholder="e.g. debt-resolution" />
                                        <button type="button" onClick={generateSlug} className="px-3 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="สร้างจากชื่อโครงการ"><Wand2 size={16}/></button>
                                    </div>
                                    <p className="text-[10px] text-blue-500 mt-1">ใช้ตัวพิมพ์เล็กและขีดกลาง (-) เท่านั้น ห้ามเว้นวรรค</p>
                                </div>
                             </div>

                             <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase block mb-1">รูปปก (Image URL)</label><div className="flex gap-2"><input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded text-sm" placeholder="URL รูปภาพ" />{coverImage && (<div className="w-10 h-10 rounded overflow-hidden border border-slate-200 shrink-0"><img src={coverImage} alt="Preview" className="w-full h-full object-cover" /></div>)}</div></div>
                             
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">หมวดหมู่</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} required className="w-full p-2 border rounded text-sm bg-white">
                                    <option value="">-- เลือกหมวดหมู่ --</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                             </div>
                             <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">ลำดับ</label><input type="number" value={order} onChange={e => setOrder(e.target.value)} className="w-full p-2 border rounded text-sm font-mono text-center bg-slate-100 text-slate-500 cursor-not-allowed" disabled/></div>
                             <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase block mb-1">คำอธิบายย่อ</label><textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded text-sm" /></div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded border border-amber-200">
                             <label className="text-xs font-bold text-amber-800 uppercase block mb-1">หัวข้อส่วนเนื้อหา (Custom Title)</label>
                             <input type="text" value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="ค่าเริ่มต้น: รายละเอียดและผลการดำเนินงาน" className="w-full p-2 border rounded text-sm bg-white"/>
                        </div>

                        {/* --- [RESTORED] ส่วนจัดการหมวดหมู่ที่หายไป --- */}
                        <div className="p-4 bg-slate-50 rounded border border-slate-200">
                             <label className="text-xs font-bold text-slate-500 uppercase block mb-2">จัดการหมวดหมู่ (Categories)</label>
                             <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="เพิ่มชื่อหมวดหมู่ใหม่..." className="flex-1 p-2 border rounded text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}/>
                                    <button type="button" onClick={handleAddCategory} className="px-4 py-2 bg-teal-600 text-white rounded text-sm font-bold hover:bg-teal-700 flex items-center gap-1"><Plus size={14}/> เพิ่ม</button>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                                    {categories.map(cat => (
                                        <div key={cat} className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full border text-xs shadow-sm transition-all ${editingCategory === cat ? 'bg-amber-100 border-amber-300 w-full md:w-auto' : 'bg-white border-slate-300'}`}>
                                            {editingCategory === cat ? (
                                                <>
                                                    <input type="text" value={tempEditValue} onChange={(e) => setTempEditValue(e.target.value)} className="bg-transparent border-b border-amber-400 focus:outline-none text-slate-800 font-bold min-w-[120px]" autoFocus />
                                                    <button type="button" onClick={saveEditCategory} className="p-1 text-green-600 hover:bg-green-100 rounded-full"><Check size={14}/></button>
                                                    <button type="button" onClick={cancelEditCategory} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><X size={14}/></button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-slate-600">{cat}</span>
                                                    <div className="flex gap-1 border-l border-slate-200 pl-2 ml-1">
                                                        <button type="button" onClick={() => startEditCategory(cat)} className="text-slate-400 hover:text-amber-500 transition-colors" title="แก้ไขชื่อ"><Pencil size={10}/></button>
                                                        <button type="button" onClick={() => handleRemoveCategory(cat)} className="text-slate-400 hover:text-red-500 transition-colors" title="ลบ"><X size={12}/></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                        {/* ----------------------------------------------- */}

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                 <label className="text-sm font-bold text-slate-700 uppercase">ส่วนเนื้อหา (Content Blocks)</label>
                                 <button type="button" onClick={addBlock} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded text-xs font-bold hover:bg-teal-700 shadow-sm"><PlusCircle size={14}/> เพิ่มเนื้อหาใหม่</button>
                             </div>
                             <div className="space-y-4">
                                {blocks.map((block, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group">
                                         <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Block {index + 1}</span>
                                                <button type="button" onClick={() => updateBlock(index, 'published', !block.published)} className={`text-xs px-2 py-0.5 rounded font-bold transition-colors ${block.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600 opacity-60'}`}>
                                                    {block.published ? '✓ แสดง' : '○ Draft'}
                                                </button>
                                            </div>
                                            <div className="flex gap-1">
                                                <button type="button" onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" disabled={index===0}><ArrowUp size={14}/></button>
                                                <button type="button" onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" disabled={index===blocks.length-1}><ArrowDown size={14}/></button>
                                                <button type="button" onClick={() => removeBlock(index)} className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                                            </div>
                                         </div>
                                         <div className="space-y-3">
                                             <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">หัวข้อ (Heading)</label><input type="text" value={block.heading || ""} onChange={e => updateBlock(index, 'heading', e.target.value)} className="w-full p-2 border rounded text-sm font-semibold"/></div>
                                             <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">เนื้อหา (Paragraph)</label><textarea value={block.content || ""} onChange={e => updateBlock(index, 'content', e.target.value)} rows={4} className="w-full p-2 border rounded text-sm"/></div>
                                             <div className="pt-2 border-t border-slate-100">
                                                 <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">สื่อประกอบ (Media)</label>
                                                 <div className="flex gap-2 mb-3">
                                                     {['none', 'image', 'video', 'quote'].map(type => (
                                                         <button key={type} type="button" onClick={() => updateBlock(index, 'mediaType', type)} className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded border transition-colors ${block.mediaType === type ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                                             {type === 'none' && 'ไม่มี'} {type === 'image' && <><ImageIcon size={12}/> รูปภาพ</>} {type === 'video' && <><Video size={12}/> วิดีโอ</>} {type === 'quote' && <><Quote size={12}/> คำคม</>}
                                                         </button>
                                                     ))}
                                                 </div>
                                                 {block.mediaType === 'image' && (<div className="space-y-2 bg-slate-50 p-2 rounded border border-slate-200"><input type="text" value={block.mediaSrc || ""} onChange={e => updateBlock(index, 'mediaSrc', e.target.value)} className="w-full p-2 border rounded text-xs" placeholder="URL รูปภาพ"/><input type="text" value={block.caption || ""} onChange={e => updateBlock(index, 'caption', e.target.value)} className="w-full p-2 border-b text-xs text-center bg-transparent focus:border-slate-400 outline-none" placeholder="คำอธิบายภาพ"/></div>)}
                                                 {block.mediaType === 'video' && (<div className="space-y-2 bg-slate-50 p-2 rounded border border-slate-200"><div className="flex items-center gap-2 text-xs text-red-500 font-bold mb-1"><Video size={12}/> YouTube Only</div><input type="text" value={block.mediaSrc || ""} onChange={e => updateBlock(index, 'mediaSrc', e.target.value)} className="w-full p-2 border rounded text-xs" placeholder="วางลิงก์ YouTube"/><input type="text" value={block.caption || ""} onChange={e => updateBlock(index, 'caption', e.target.value)} className="w-full p-2 border-b text-xs text-center bg-transparent focus:border-slate-400 outline-none" placeholder="คำอธิบายวิดีโอ"/></div>)}
                                                 {block.mediaType === 'quote' && (<div className="space-y-2 bg-slate-50 p-2 rounded border border-slate-200"><textarea value={block.mediaSrc || ""} onChange={e => updateBlock(index, 'mediaSrc', e.target.value)} rows={2} className="w-full p-2 border rounded text-xs italic" placeholder="พิมพ์ข้อความคำคม..."/><input type="text" value={block.caption || ""} onChange={e => updateBlock(index, 'caption', e.target.value)} className="w-1/2 p-2 border rounded text-xs" placeholder="ผู้กล่าว (Author)"/></div>)}
                                             </div>
                                         </div>
                                    </div>
                                ))}
                                {blocks.length === 0 && (<div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">ยังไม่มีเนื้อหา กดปุ่มด้านบน</div>)}
                             </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur py-4 -mx-6 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t z-50">
                            <button type="submit" disabled={loading} className={`flex-1 py-3 px-4 font-bold rounded-lg text-white shadow-md transition flex items-center justify-center gap-2 ${editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
                                <Save size={18}/> {loading ? "กำลังบันทึก..." : (editId ? "บันทึกการแก้ไข" : "สร้างโครงการใหม่")}
                            </button>
                            {editId && <button type="button" onClick={resetForm} className="px-6 border rounded-lg text-slate-500 hover:bg-slate-50 font-bold">ยกเลิก</button>}
                        </div>
                    </form>
                </div>
            </div>

            {/* List Side */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-6 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold">รายการ ({projectsList.length})</h2>
                        <button onClick={fetchProjects} className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full"><RefreshCw size={16}/></button>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                        {projectsList.map((item, index) => (
                            <div key={item.id} onClick={() => handleEditClick(item)} className={`flex gap-3 p-3 rounded border cursor-pointer transition relative group ${editId === item.id ? 'border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-200' : 'hover:bg-slate-50'}`}>
                                <div className="flex flex-col gap-1 items-center justify-center pr-2 border-r border-slate-200 mr-2">
                                    <span className="text-[10px] font-bold text-slate-500">{item.order}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate">{item.title}</h3>
                                    {/* [NEW] แสดง Slug ในรายการด้วย */}
                                    <p className="text-[10px] text-blue-500 font-mono truncate">{item.slug ? `/${item.slug}` : '(no-link)'}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}