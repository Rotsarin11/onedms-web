# OneDMS Web (หน้าบ้าน)

โครงหน้าเว็บระบบจัดเก็บเอกสาร PO / Invoice — ขึ้นโครงจาก mockup (.png) 7 หน้า ใช้ข้อมูลจำลอง ยังไม่เชื่อม API จริง

## เครื่องมือ

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · component แบบ shadcn/ui (Radix) · TanStack Query · TanStack Table v8 · React Router · React Hook Form + Zod · react-pdf · dnd-kit · dayjs · lucide-react · oxlint

## เริ่มใช้งาน

ต้องมี Node.js 22 LTS ขึ้นไป

```bash
npm install
npm run dev        # เปิด http://localhost:5173
npm run build      # สร้างไฟล์สำหรับวางบนเซิร์ฟเวอร์ใน dist/
npm run lint
```

ตัวแปรที่ตั้งได้ (ไฟล์ `.env.local`)

| ตัวแปร | ใช้ทำอะไร |
|---|---|
| `VITE_BASE` | path ที่วางเว็บ เช่น `/onedms/` (ค่าเริ่มต้น `/`) |
| `VITE_ROUTER` | ตั้งเป็น `hash` ถ้าเซิร์ฟเวอร์ยังไม่ได้ตั้ง URL rewrite |
| `VITE_API_BASE_URL` | ที่อยู่ API จริง (ค่าเริ่มต้น `/api`) |
| `VITE_API_PROXY` | ตอน `npm run dev` ส่ง `/api` ไปที่ backend .NET เช่น `http://localhost:5000` |

บน IIS ถ้าใช้ browser router ต้องตั้ง URL Rewrite ให้ทุกเส้นทางไปที่ `index.html`

## หน้าที่ทำแล้ว

| เส้นทาง | หน้า |
|---|---|
| `/documents` | รายการเอกสาร (ค้นหา, กรอง PO/Invoice/ปี/เดือน/หมวดหมู่/ผู้ขาย/สถานะ, แผงสรุป) |
| `/documents/:id` | รายละเอียด PO / Invoice (PDF แบบแท็บ + ซูม, ยอดเงิน, เอกสารอ้างอิง, ก่อนหน้า/ถัดไป) |
| `/settings/master/company` | ข้อมูลหลัก: บริษัท |
| `/settings/master/vendor` | ข้อมูลหลัก: ผู้ขาย |
| `/settings/master/type` | ข้อมูลหลัก: ประเภทเอกสาร (ลากเรียงลำดับ) |
| `/settings/master/subtype` | ข้อมูลหลัก: หมวดหมู่ (ลากเรียงลำดับ) |

หน้าข้อมูลหลักแก้ไข/เพิ่ม/บันทึกได้จริงในหน่วยความจำ (รีเฟรชแล้วกลับค่าเดิม) พร้อมตรวจข้อมูล เช่น เลขผู้เสียภาษี 13 หลัก

## ส่วนที่ยังไม่ทำ (ไม่มี mockup หรือต้องใช้ API)

ปุ่มเหล่านี้แสดงตาม mockup แต่กดแล้วขึ้นข้อความแจ้งเตือนแทน

- ไม่มี mockup: เพิ่มเอกสาร, แก้ไขเอกสาร, เมนูรายงาน, ผู้ใช้และสิทธิ์, ข้อผิดพลาดระบบ
- ต้องใช้ API: ส่งออก Excel, นำเข้าจาก Excel, ดาวน์โหลดไฟล์, ออกจากระบบ, สลับบริษัท

## โครงสร้าง

```
src/
├─ app/              router + layout หลัก (header, เมนู)
├─ components/       PdfViewer, InfoTable และ components/ui (button, input, select, switch, badge)
├─ features/
│  ├─ documents/     รายการ + รายละเอียด PO / Invoice
│  └─ master/        ข้อมูลหลัก 4 แท็บ
├─ lib/api/          ชั้นเรียก API (ตอนนี้ใช้ข้อมูลจำลอง) — เปลี่ยนเป็น API จริงที่นี่ที่เดียว
├─ mocks/data.ts     ข้อมูลจำลองจาก mockup เท่านั้น
└─ types/models.ts   ชนิดข้อมูลตาม ER Diagram
```

## ทดสอบการแสดง PDF

mockup แสดงชื่อไฟล์ แต่ไม่มีไฟล์จริง ให้วาง PDF ชื่อเดียวกันไว้ใน `public/mock-files/` เช่น `PO_1012600472.pdf`, `QT2601659-01.pdf`, `IV2610-00458.pdf`, `ใบกำกับภาษี.pdf`

## สิ่งที่ต้องยืนยัน (TODO)

- ฟอนต์และค่าสีจากไฟล์ Figma ต้นฉบับ (ตอนนี้ใช้ IBM Plex Sans Thai และสีที่วัดจากภาพ)
- ไฟล์โลโก้จริง (ตอนนี้ตัดจากภาพ mockup)
- ค่า `DocumentStatus` จริงจาก backend (ตอนนี้ใช้ `SAVED` / `DRAFT` / `CANCELLED`)
- ข้อมูล Invoice IV2610-00458 ใน mockup ไม่ตรงกันระหว่างหน้ารายการกับหน้ารายละเอียด (ดูหมายเหตุใน `src/mocks/data.ts`)
- รูปแบบ API และ Swagger/OpenAPI ของ backend .NET
