# Excel Order / Stock Web App

เว็บสำหรับจัดการและตรวจสอบข้อมูล Excel / ORDER / Stock ในหน้าเดียว

## โครงสร้างโปรเจกต์

```text
.
├── index.html
├── bank.jpg
├── css/
│   └── style.css
├── js/
│   └── app.js
├── SOURCE-backup-dashboard-fixed.html
├── .gitignore
└── .nojekyll
```

## เปิดใช้งานแบบ Local

เปิด `index.html` ด้วยเว็บเบราว์เซอร์ได้โดยตรง

## Deploy ด้วย GitHub Pages

1. สร้าง GitHub Repository ใหม่
2. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดในโปรเจกต์นี้ โดยให้ `index.html` อยู่ที่ root ของ Repository
3. ไปที่ **Settings → Pages**
4. ใน **Build and deployment** เลือก **Deploy from a branch**
5. เลือก branch `main` และ folder `/ (root)`
6. กด **Save**

หลังจาก GitHub Pages deploy เสร็จ จะได้ลิงก์ประมาณ:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

## หมายเหตุ

- อย่าลบ `bank.jpg` เพราะใช้เป็นภาพพื้นหลัง
- อย่าย้าย `css/style.css` หรือ `js/app.js` โดยไม่แก้ path ใน `index.html`
- ไฟล์ `SOURCE-backup-dashboard-fixed.html` เป็นไฟล์สำรอง ไม่จำเป็นต่อการทำงานของ `index.html`
