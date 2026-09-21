ORDER V1 - Supabase Online Database

เวอร์ชันนี้แก้ปัญหา Failed to fetch ให้แสดงสาเหตุละเอียดขึ้น และเพิ่ม GRANT สำหรับ Data API ใน SUPABASE_SETUP.sql

ทำใน Supabase SQL Editor:
1) เปิดไฟล์ SUPABASE_SETUP.sql
2) Copy ทั้งหมด
3) Paste ใน SQL Editor
4) กด Run

จากนั้นรีเฟรชเว็บ GitHub Pages แบบ Ctrl+Shift+R แล้วลองกด "ดึงข้อมูลล่าสุดจาก Database"

ถ้ายังมีปัญหา กล่องแจ้งเตือนจะแสดง Code / Details / Hint เพื่อหาสาเหตุได้ตรงจุด

หมายเหตุ: ใช้ anon/public key ได้ แต่ Supabase กำลังทยอยเปลี่ยนไปใช้ Publishable key; เมื่อมี sb_publishable_... สามารถนำมาแทน anonKey ได้โดยไม่ต้องใช้ secret key
