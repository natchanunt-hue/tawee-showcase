import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <--- 1. เพิ่มบรรทัดนี้

const firebaseConfig = {
  // ... ค่า Config เดิมของคุณ ...
  apiKey: "AIzaSyBGxVUfryG5S5wwGunigipES364YG-AHrI",
  authDomain: "tawee-showcase.firebaseapp.com",
  projectId: "tawee-showcase",
  storageBucket: "tawee-showcase.firebasestorage.app",
  messagingSenderId: "768450775564",
  appId: "1:768450775564:web:8b26023ce9a4963b9cfc29",
  measurementId: "G-P9YWGDDZNL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // <--- 2. เพิ่มบรรทัดนี้ เพื่อส่งออกระบบ Login