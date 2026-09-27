# DentaCare - Stomatologiya Boshqaruv Tizimi (CRM)

Zamonaviy va qulay stomatologiya klinikasi boshqaruv tizimi.

---

## 📁 Loyiha Tarkibi va Fayllar

* [login.html](file:///Users/macbook/Desktop/Новая%20папка%2016/login.html) — `bg.png` foni ustidagi minimalist kirish sahifasi va tilni tanlash (UZ / RU).
* [index.html](file:///Users/macbook/Desktop/Новая%20папка%2016/index.html) — Asosiy Dashboard va Boshqaruv Paneli (Saidbar, Statistika, Bemorlar jadvali, Tishlar xaritasi, Xizmatlar, Xodimlar va Tilni almashtirish).
* [css/style.css](file:///Users/macbook/Desktop/Новая%20папка%2016/css/style.css) — Tibbiy dizayn, responsivlik va zamonaviy stil.
* [js/translations.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/translations.js) — Saytning to'liq O'zbek va Rus tillaridagi lug'ati (i18n).
* [js/data.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/data.js) — Bemorlar ma'lumotlari (JS Object ko'rinishida), xizmatlar va shifokorlar bazasi.
* [js/login.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/login.js) — Minimal login tekshiruvi va ikki tilli login sahifasi logikasi.
* [js/app.js](file:///Users/macbook/Desktop/Новая%20папка%2016/js/app.js) — Bemorlarni boshqarish (CRUD), ikki tilli Telegram bot va oylik hisobotlar logikasi.

---

## 🚀 Yangi Qo'shilgan Imkoniyatlar:

1. **Saytda Tilni Tanlash (O'zbek / Rus):** Saytning yuqori boshqaruv panelida (header) `🇺🇿 O'zbekcha` va `🇷🇺 Русский` til tugmalari joylashtirildi. Foydalanuvchi bitta bosishda butun saytni (menyu, statistika, bemorlar jadvali, tishlar xaritasi, xizmatlar, xodimlar va hisobotlar) o'zi xohlagan tilga o'tkaza oladi.
2. **Telegram Botda Ikki Tilli Muloqot:** Bemor botga kirganda (`/start` yoki QR-kod orqali), bot unga birinchi navbatda til tanlash tugmalarini taqdim etadi (`🇺🇿 O'zbekcha` | `🇷🇺 Русский`). Bemor tanlagan tiliga qarab barcha xabarlar, shifokor yozgan retseptlar va doimiy boshqaruv menyusi aynan shu tilda yuboriladi.
3. **Yangi Ishchi / Shifokor Qo'shish:** "Ishchilar & Shifokorlar" bo'limida yangi xodimlarni ismi, mutaxassisligi, ish staji va telefoni bilan ro'yxatga olish mumkin.
4. **Yangi Xizmat Turini Qo'shish:** "Xizmatlar & Narxlar" bo'limida yangi stomatologik muolaja narxi va davomiyligi bilan qo'shish imkoniyati yaratildi.
5. **Minimalist Kirish Oynasi:** Parollar va ortiqcha demo matnlar tozalangan, `bg.png` foni ustidagi chiroyli kirish oynasi.
6. **24/7 Ish Tartibi (Rejim):** 24/7 kechayu-kunduz uzluksiz rejim indikatorlari va smenalar tizimi.
7. **Oylik Hisobotlar Tizimi:** Xodimlar va oylar bo'yicha tushumlar, PDF chop etish va Excel (CSV) yuklab olish imkoniyatlari.
