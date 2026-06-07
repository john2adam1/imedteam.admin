# iMed Admin Panel - Loyiha bo'yicha Texnik Topshiriq (TZ) va Ma'lumotnoma

Ushbu hujjat **iMed** ta'lim platformasi admin panelini davom ettiruvchi dasturchi uchun mo'ljallangan. Unda loyihaning arxitekturasi, ishlash tamoyillari va keyingi qilinishi kerak bo'lgan ishlar batafsil yoritilgan.

## 1. Loyiha haqida umumiy ma'lumot
**iMed Admin Panel** - bu o'quv markazi yoki onlayn platformaning barcha resurslarini (kurslar, foydalanuvchilar, buyurtmalar, chegirmalar va h.k.) boshqarish uchun yaratilgan boshqaruv paneli.

- **Maqsad:** Platforma kontentini boshqarish, savdolarni kuzatish va foydalanuvchilar bilan ishlash.
- **Asosiy yo'nalish:** Ierarxik va kontekstli boshqaruv (Mavzular -> Kurslar -> Modullar -> Darslar).

## 2. Texnologik Stek (Tech Stack)
Loyiha zamonaviy va tezkor texnologiyalar asosida qurilgan:

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Til:** [TypeScript](https://www.typescriptlang.org/)
- **Stillar:** [Tailwind CSS](https://tailwindcss.com/)
- **API Client:** [Axios](https://axios-http.com/)
- **Holatni boshqarish:** React Hooks va URL States
- **Ikonkalar:** [Lucide React](https://lucide.dev/)
- **Bildirishnomalar:** [Sonner](https://sonner.steventey.com/)
- **Token management:** `js-cookie` va `localStorage`

## 3. Loyiha Strukturasi (Project Structure)
Loyiha `app` router arxitekturasiga asoslangan:

- `app/admin/`: Barcha admin sahifalari (Dashboard, Users, Orders, etc.)
- `components/`: Qayta ishlatiluvchi UI komponentlar (Table, Modal, Breadcrumb, Header, Sidebar)
- `services/`: API bilan ishlash uchun xizmat ko'rsatish qatlami (har bir modul uchun alohida `.service.ts` fayl)
- `types/`: Global TypeScript interfeyslari va turlari
- `lib/api/`: Axios client konfiguratsiyasi va interceptorlar
- `public/`: Statik resurslar (rasmlar, logolar)

## 4. Asosiy Funksionalliklar

### 4.1. Kontent Boshqaruvi (LMS)
- **Subjects (Mavzular):** Kurslarni guruhlash uchun eng yuqori daraja.
- **Courses (Kurslar):** Mavzular ichida joylashgan kurslar.
- **Modules (Modullar):** Kurs tarkibidagi bo'limlar.
- **Lessons (Darslar):** Eng quyi daraja (Video, PDF, Testlar).
- **Navigation:** Breadcrumb orqali chuqur ierarxiya bo'ylab oson harakatlanish imkoniyati.

### 4.2. Savdo va Marketing
- **Orders (Buyurtmalar):** Sotib olingan kurslar ro'yxati, statuslarni boshqarish.
- **Promocodes (Promokodlar):** Chegirma kodlarini yaratish, amal qilish muddatini belgilash va kurslarga biriktirish.
- **Tariffs (Tariflar):** Kurslar uchun narx rejalarini boshqarish.

### 4.3. Foydalanuvchilar va Xodimlar
- **Users (Foydalanuvchilar):** Ro'yxatdan o'tgan foydalanuvchilar ma'lumotlari va ular sotib olgan kurslar.
- **Teachers (O'qituvchilar):** Platformadagi o'qituvchilar bazasi.

### 4.4. Qo'shimcha Modullar
- **Banners:** Asosiy sahifa uchun reklama bannerlari.
- **Notifications:** Foydalanuvchilarga bildirishnomalar yuborish.
- **FAQ:** Ko'p beriladigan savollar.
- **Sources:** Foydalanuvchilar qayerdan kelayotganini kuzatish (Traffic sources).

## 5. Muhim Ishlash Tamoyillari

### 5.1. API Integratsiyasi
Barcha API so'rovlar `services/` papkasidagi service'lar orqali amalga oshiriladi. 
**Masalan:** Darslar bilan ishlash uchun `lesson.service.ts` ishlatiladi.
Service'lar `axiosInstance` dan foydalanadi (`lib/api/axios.ts`), bu yerda avtomatik ravishda `Authorization` header'i qo'shiladi.

### 5.2. Qidiruv va Filtrlash (Standardization)
Loyihada qidiruv va filtrlash tizimi standartlashtirilgan. Keyingi dasturchi bunga amal qilishi kerak:
- Filtrlash yoki sahifalash o'zgarganda `page` har doim 1-ga qaytariladi.
- `SearchFilters.tsx` komponenti orqali qidiruv so'rovlari URL query parametrlari bilan sinxron ishlaydi.

### 5.3. Interfeys dizayni
Barcha sahifalarda bir xil layout va komponentlar ishlatiladi:
- `Table` komponenti: Ma'lumotlarni chiqarish uchun.
- `Modal` va `Form` komponentlari: Ma'lumot qo'shish va tahrirlash uchun.
- `Lucide` ikonalari: Vizual dizayn uchun.

## 6. O'rnatish va Ishga Tushirish
1. Repozitoriyani klonlash: `git clone <url>`
2. Kutubxonalarni o'rnatish: `npm install`
3. Muhit o'zgaruvchilarini sozlash (`.env` faylida):
   ```env
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```
4. Loyihani dev-rejimda ishga tushirish: `npm run dev`

## 7. Keyingi Rejalar va Takliflar (To-Do List)
1. **Fayl yuklash:** Rasmlar va video darslarni yuklash jarayonini yaxshilash (`upload.service.ts` ni kengaytirish).
2. **Validatsiya:** Formada kiritilayotgan ma'lumotlarni `Zod` yoki `Yup` orqali validatsiya qilish.
3. **Statistika:** Dashboard sahifasida grafiklar (Charts) orqali batafsil statistikani chiqarish.
4. **Drag & Drop:** Kurs modullari va darslar ketma-ketligini sudrab o'zgartirish (DnD) funksiyasini qo'shish.
5. **Real-time:** Foydalanuvchilar aktivligini kuzatish uchun real-time bildirishnomalar.

---
**Omad!** Savollar bo'lsa, loyihaning avvalgi commitlari va `README.md` faylini ko'zdan kechiring.
