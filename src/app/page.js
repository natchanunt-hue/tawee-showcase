// src/app/page.js
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../lib/firebase"; 
import HomeClient from "./HomeClient"; 

async function getProjects() {
  try {
    const q = query(collection(db, "projects")); 
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs
      .map((doc) => {
        const docData = doc.data();
        return { 
          id: doc.id, 
          ...docData,
          createdAt: docData.createdAt ? docData.createdAt.toDate().toISOString() : null,
          updatedAt: docData.updatedAt ? docData.updatedAt.toDate().toISOString() : null,
          // ✅ ตรวจสอบค่า order ถ้าไม่มีให้เป็น 999 (ไปอยู่ท้ายสุด)
          order: typeof docData.order === 'number' ? docData.order : 999 
        };
      })
      .filter((item) => item.published !== false)
      // ✨ เพิ่มบรรทัดนี้: เรียงจากน้อยไปมาก (1, 2, 3...)
      .sort((a, b) => a.order - b.order); 
      
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export default async function Page() {
  const projects = await getProjects();
  return <HomeClient initialProjects={projects} />;
}