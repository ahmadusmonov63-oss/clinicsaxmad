# DentaCare - Stomatologiya Boshqaruv Tizimi (CRM)

Zamonaviy va qulay stomatologiya klinikasi boshqaruv tizimi.

---

## 🔑 Tizimga Kirish Ma'lumotlari

* **Login:** `ahmad`
* **Parol:** `1234`

---

## 📁 Loyiha Tarkibi va Fayllar

* [login.html](file:///Users/macbook/Desktop/Новая%20папка%2016/login.html) — `bg.png` foni ustidagi minimalist kirish sahifasi (faqat 2 ta input va 1 ta kirish tugmasi, ortiqcha ramka va podskazkalar yo'qotilgan).
* [index.html](file:///Users/macbook/Desktop/Новая%20папка%2016/index.html) — Asosiy Dashboard va Boshqaruv Paneli (Saidbar, Statistika, Bemorlar jadvali, Tishlar xaritasi, Xizmatlar va Xodimlar).
* [css/style.css](file:///Users/macbook/Desktop/Новая%20папка%2016/css/style.css) — Tibbiy dizayn, responsivlik va zamonaviy stil.
* [js/data.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/data.js) — Bemorlar ma'lumotlari (JS Object ko'rinishida), xizmatlar va shifokorlar bazasi.
* [js/login.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/login.js) — Minimal login tekshiruvi (`ahmad` / `1234`) va xatoliklar ogohlantirishi.
* [js/app.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/app.js) — Bemorlarni boshqarish (CRUD), yangi ishchi/shifokorlarni qo'shish va yangi xizmat turlarini qo'shish logikasi.

---

## 🚀 Yangi Qo'shilgan Imkoniyatlar:

1. **Yangi Ishchi / Shifokor Qo'shish:** "Ishchilar & Shifokorlar" bo'limida yangi xodimlarni ismi, mutaxassisligi, ish staji va telefoni bilan ro'yxatga olish mumkin. Qo'shilgan ishchilar avtomatik ravishda yangi bemor qo'shishdagi shifokorlar tanlovida chiqadi.
2. **Yangi Xizmat Turini Qo'shish:** "Xizmatlar & Narxlar" bo'limida yangi stomatologik muolaja, uning narxi va davomiyligi bilan qo'shish imkoniyati yaratildi. Narxlar bemor qo'shishda avtomatik hisoblanadi.
3. **Minimalist Kirish Oynasi:** Foydalanuvchi joylagan `bg.png` foni o'rnatildi, barcha podskazkalar, demo bloklar va ramkalar olib tashlandi. Faqat 2 ta input (Login, Parol) va bitta "Kirish" tugmasi qoldirildi.
4. **24/7 Ish Tartibi (Rejim):** Ish vaqtlari 24/7 kechayu-kunduz uzluksiz rejimga o'zgartirildi. Saidbar foni, yuqori boshqaruv paneli (header) va shifokorlar sahifasida yashil pulsatsiyali jonli indikator va 24/7 navbatchilik smenalari haqida to'liq ma'lumotlar aks ettirildi.
5. **Oylik Hisobotlar Tizimi:** Ishchilar oy oxirida hisobot tuzishda va topshirishda qiynalmasliklari uchun maxsus "Oylik Hisobotlar" bo'limi yaratildi:
   - **Xodimlar oylik hisoboti:** Har bir shifokor/ishchining shu oyda qabul qilgan bemorlari soni, xizmat hajmi, kassaga tushgan tushum, qoldiq qarz va undirish foizi ko'rsatiladi. Bitta tugma bilan xodim bo'yicha shaxsiy hisobotni filtrlash mumkin.
   - **Oylar bo'yicha dinamika:** Har bir oyda tushgan umumiy summalar va bemorlar soni jadvali har doim yangilanib turadi.
   - **Xizmatlar tahlili:** Qaysi muolajalardan eng ko'p tushum bo'lganligi diagrammasi.
   - **Chop etish (PDF) va Excel (CSV) eksport:** Oylik hisobotni 1 ta bosishda printerdan rasmiy blankda chiqarish (muhr va imzo o'rni bilan) yoki Excel dasturida ochiladigan formatda yuklab olish imkoniyati.
   - **Real-vaqtda yangilanish:** Har bir yangi bemor kiritilganda yoki to'lov o'zgarganda oylik summalar va bemorlar soni avtomatik qayta hisoblanadi.
