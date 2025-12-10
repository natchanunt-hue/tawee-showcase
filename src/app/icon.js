import { ImageResponse } from 'next/og'

// ตั้งค่า Runtime
export const runtime = 'edge'

// ตั้งค่าขนาด
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// ฟังก์ชันสร้างไอคอน
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: '24px',      // [ปรับ] เพิ่มขนาดให้ใหญ่ขึ้นอีกนิด (เดิม 20px)
          background: '#0d9488', // สีเขียว Teal
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
          fontWeight: 900,       // [ปรับ] เปลี่ยนเป็น 900 (หนาสุดๆ)
        }}
      >
        T
      </div>
    ),
    {
      ...size,
    }
  )
}