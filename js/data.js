// Stomatologiya xizmatlari ro'yxati (Boshlang'ich ma'lumotlar)
const defaultServices = [
    { id: "S-1", name: "Konsultatsiya & Ko'rik", price: 50000, duration: "20 daqiqa" },
    { id: "S-2", name: "Tish tozalash & Oqartirish (Air Flow)", price: 300000, duration: "45 daqiqa" },
    { id: "S-3", name: "Kariesni davolash (Fotopolimer plomba)", price: 450000, duration: "40 daqiqa" },
    { id: "S-4", name: "Pulpit va Kanal davolash (Endodontiya)", price: 650000, duration: "60 daqiqa" },
    { id: "S-5", name: "Tishni og'riqsiz sug'urish (Ekstraktsiya)", price: 250000, duration: "30 daqiqa" },
    { id: "S-6", name: "Aql tishini murakkab jarrohlik olish", price: 700000, duration: "60 daqiqa" },
    { id: "S-7", name: "Metall-keramika tojburchak (Koronka)", price: 1200000, duration: "3 kun" },
    { id: "S-8", name: "Sirkoniy tojburchak (Zirconia)", price: 2200000, duration: "4 kun" },
    { id: "S-9", name: "Dental Implant o'rnatish (Osstem)", price: 4500000, duration: "90 daqiqa" },
    { id: "S-10", name: "Breket tizimi o'rnatish (Metall)", price: 6000000, duration: "120 daqiqa" }
];

// Shifokorlar va xodimlar ro'yxati (Boshlang'ich ma'lumotlar)
const defaultDoctors = [
    { 
        id: "DOC-1", 
        name: "Dr. Ahmadbek Karimov", 
        specialty: "Bosh shifokor & Terapevt", 
        experience: "12 yil", 
        phone: "+998 90 777 01 01",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    },
    { 
        id: "DOC-2", 
        name: "Dr. Nilufar Saidova", 
        specialty: "Ortodont & Estetik stomatolog", 
        experience: "8 yil", 
        phone: "+998 93 555 12 34",
        avatar: "https://images.unsplash.com/photo-1594824813589-9d54a2618991?w=150&auto=format&fit=crop&q=80"
    },
    { 
        id: "DOC-3", 
        name: "Dr. Bobur Ergashev", 
        specialty: "Jarroh-Implantolog", 
        experience: "10 yil", 
        phone: "+998 97 444 88 99",
        avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"
    },
    { 
        id: "DOC-4", 
        name: "Dr. Madina Qodirova", 
        specialty: "Bolalar stomatologi", 
        experience: "6 yil", 
        phone: "+998 99 222 33 44",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
    }
];

// Bemorlar ro'yxati (Boshlang'ich ma'lumotlar OBJ shaklida)
const initialPatients = [
    {
        id: "DENT-101",
        fullName: "Akmal Saidov",
        phone: "+998 90 123 45 67",
        age: 32,
        gender: "Erkak",
        diagnosis: "O'tkir chuqur karies, emal yorilishi",
        toothNumber: "16, 26",
        serviceId: "S-3",
        serviceName: "Kariesni davolash (Fotopolimer plomba)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-09-25 10:00",
        totalAmount: 450000,
        paidAmount: 450000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Muolaja muvaffaqiyatli yakunlandi. Anesteziyaga reaksiyasi normal.",
        createdAt: "2026-09-20"
    },
    {
        id: "DENT-102",
        fullName: "Zilola Mahmudova",
        phone: "+998 93 987 65 43",
        age: 26,
        gender: "Ayol",
        diagnosis: "Gingivit va qattiq tish toshlari",
        toothNumber: "Yuqori va pastki qator",
        serviceId: "S-2",
        serviceName: "Tish tozalash & Oqartirish (Air Flow)",
        doctor: "Dr. Nilufar Saidova",
        appointmentDate: "2026-09-25 11:30",
        totalAmount: 300000,
        paidAmount: 300000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Air flow muolajasi qilindi, ftor bilan emal mustahkamlandi.",
        createdAt: "2026-09-22"
    },
    {
        id: "DENT-103",
        fullName: "Sardor Olimov",
        phone: "+998 97 712 34 56",
        age: 41,
        gender: "Erkak",
        diagnosis: "Surunkali periodontit, tish yo'qolishi",
        toothNumber: "46",
        serviceId: "S-9",
        serviceName: "Dental Implant o'rnatish (Osstem)",
        doctor: "Dr. Bobur Ergashev",
        appointmentDate: "2026-09-25 14:00",
        totalAmount: 4500000,
        paidAmount: 2000000,
        status: "Davolanmoqda",
        paymentStatus: "Qisman to'langan",
        notes: "Implant o'rnatildi, choklar olindi. 3 oydan keyin metallo-keramika o'rnatiladi.",
        createdAt: "2026-09-15"
    },
    {
        id: "DENT-104",
        fullName: "Nargiza Yusupova",
        phone: "+998 99 333 44 55",
        age: 19,
        gender: "Ayol",
        diagnosis: "Distal tishlarning qiyshayishi, distal prikus",
        toothNumber: "Ikkala jag'",
        serviceId: "S-10",
        serviceName: "Breket tizimi o'rnatish (Metall)",
        doctor: "Dr. Nilufar Saidova",
        appointmentDate: "2026-09-25 16:30",
        totalAmount: 6000000,
        paidAmount: 3000000,
        status: "Davolanmoqda",
        paymentStatus: "Qisman to'langan",
        notes: "Yuqori va pastki jag'ga metall breket o'rnatildi. Oylik aktivatsiya tayinlangan.",
        createdAt: "2026-09-10"
    },
    {
        id: "DENT-105",
        fullName: "Jasur Qosimov",
        phone: "+998 91 444 77 88",
        age: 35,
        gender: "Erkak",
        diagnosis: "O'tkir diffuz pulpit (kechasi qattiq og'riq)",
        toothNumber: "36",
        serviceId: "S-4",
        serviceName: "Pulpit va Kanal davolash (Endodontiya)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-09-26 09:00",
        totalAmount: 650000,
        paidAmount: 0,
        status: "Kutilmoqda",
        paymentStatus: "To'lanmagan",
        notes: "Kanal ochilgan, dori qo'yilgan. Ikkinchi seansga keladi.",
        createdAt: "2026-09-24"
    },
    {
        id: "DENT-106",
        fullName: "Rayhona Karimova",
        phone: "+998 95 111 22 33",
        age: 8,
        gender: "Ayol",
        diagnosis: "Sut tishining kariesi va harakatchanligi",
        toothNumber: "74",
        serviceId: "S-5",
        serviceName: "Tishni og'riqsiz sug'urish (Ekstraktsiya)",
        doctor: "Dr. Madina Qodirova",
        appointmentDate: "2026-09-26 11:00",
        totalAmount: 150000,
        paidAmount: 150000,
        status: "Kutilmoqda",
        paymentStatus: "To'langan",
        notes: "Bolalar uchun maxsus applikatsion anesteziya bilan sug'uriladi.",
        createdAt: "2026-09-24"
    },
    {
        id: "DENT-107",
        fullName: "Bobur Mirzayev",
        phone: "+998 90 555 44 33",
        age: 38,
        gender: "Erkak",
        diagnosis: "Tish tojburchagi shikastlanishi",
        toothNumber: "21",
        serviceId: "S-7",
        serviceName: "Metall-keramika tojburchak (Koronka)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-09-18 15:00",
        totalAmount: 1200000,
        paidAmount: 1200000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Tojburchak muvaffaqiyatli o'rnatildi, tishlash tekshirildi.",
        createdAt: "2026-09-15"
    },
    {
        id: "DENT-108",
        fullName: "Shahnoza Aliyeva",
        phone: "+998 93 444 11 22",
        age: 24,
        gender: "Ayol",
        diagnosis: "Aql tishining qiyshiq chiqishi (retensiya)",
        toothNumber: "38",
        serviceId: "S-6",
        serviceName: "Aql tishini murakkab jarrohlik olish",
        doctor: "Dr. Bobur Ergashev",
        appointmentDate: "2026-09-14 12:00",
        totalAmount: 700000,
        paidAmount: 700000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Operatsiya asoratsiz o'tdi, choklar qo'yildi.",
        createdAt: "2026-09-12"
    },
    {
        id: "DENT-109",
        fullName: "Dilshod Rahimov",
        phone: "+998 97 888 99 00",
        age: 45,
        gender: "Erkak",
        diagnosis: "Old tishlar nuqsoni, estetik tiklash",
        toothNumber: "11, 12",
        serviceId: "S-8",
        serviceName: "Sirkoniy tojburchak (Zirconia)",
        doctor: "Dr. Nilufar Saidova",
        appointmentDate: "2026-09-10 16:00",
        totalAmount: 2200000,
        paidAmount: 2200000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Sirkoniy tojburchak o'rnatildi. Estetika yuqori darajada.",
        createdAt: "2026-09-08"
    },
    {
        id: "DENT-110",
        fullName: "Umidbek Toirov",
        phone: "+998 99 123 77 88",
        age: 10,
        gender: "Erkak",
        diagnosis: "Sut tishi kariesi",
        toothNumber: "84",
        serviceId: "S-3",
        serviceName: "Kariesni davolash (Fotopolimer plomba)",
        doctor: "Dr. Madina Qodirova",
        appointmentDate: "2026-09-05 10:30",
        totalAmount: 450000,
        paidAmount: 450000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Bolalar plombasi o'rnatildi.",
        createdAt: "2026-09-04"
    },
    // ==========================================
    // 2026-YIL AVGUST OYI HISOBOTLARI (Namunaviy)
    // ==========================================
    {
        id: "DENT-091",
        fullName: "Farrux Toshmatov",
        phone: "+998 90 234 56 78",
        age: 43,
        gender: "Erkak",
        diagnosis: "Tish yo'qolishi, tish qatori nuqsoni",
        toothNumber: "36",
        serviceId: "S-9",
        serviceName: "Dental Implant o'rnatish (Osstem)",
        doctor: "Dr. Bobur Ergashev",
        appointmentDate: "2026-08-28 11:00",
        totalAmount: 4500000,
        paidAmount: 4500000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Implant o'rnatish muvaffaqiyatli yakunlandi.",
        createdAt: "2026-08-20"
    },
    {
        id: "DENT-092",
        fullName: "Gulnoza Xolmatova",
        phone: "+998 93 345 67 89",
        age: 29,
        gender: "Ayol",
        diagnosis: "O'tkir pulpit, kanal yallig'lanishi",
        toothNumber: "24",
        serviceId: "S-4",
        serviceName: "Pulpit va Kanal davolash (Endodontiya)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-08-24 14:30",
        totalAmount: 650000,
        paidAmount: 650000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Ildiz kanallari to'liq davolandi va plombalandi.",
        createdAt: "2026-08-18"
    },
    {
        id: "DENT-093",
        fullName: "Javohir Yo'ldoshev",
        phone: "+998 97 456 78 90",
        age: 21,
        gender: "Erkak",
        diagnosis: "Tishlar distal egriligi, chuqur prikus",
        toothNumber: "Yuqori va pastki jag'",
        serviceId: "S-10",
        serviceName: "Breket tizimi o'rnatish (Metall)",
        doctor: "Dr. Nilufar Saidova",
        appointmentDate: "2026-08-20 10:00",
        totalAmount: 6000000,
        paidAmount: 6000000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Breket tizimi to'liq o'rnatildi, to'lov to'liq qilindi.",
        createdAt: "2026-08-15"
    },
    {
        id: "DENT-094",
        fullName: "Munisa Rizayeva",
        phone: "+998 99 567 89 01",
        age: 33,
        gender: "Ayol",
        diagnosis: "O'rta karies",
        toothNumber: "15",
        serviceId: "S-3",
        serviceName: "Kariesni davolash (Fotopolimer plomba)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-08-16 16:00",
        totalAmount: 450000,
        paidAmount: 450000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Plomba silliqlandi, rang moslashtirildi.",
        createdAt: "2026-08-12"
    },
    {
        id: "DENT-095",
        fullName: "Alisher Umarov",
        phone: "+998 91 678 90 12",
        age: 50,
        gender: "Erkak",
        diagnosis: "Oldingi tish sinishi",
        toothNumber: "11",
        serviceId: "S-7",
        serviceName: "Metall-keramika tojburchak (Koronka)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-08-12 11:30",
        totalAmount: 1200000,
        paidAmount: 1200000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Tojburchak mustahkam o'rnatildi.",
        createdAt: "2026-08-08"
    },
    {
        id: "DENT-096",
        fullName: "Kamola Saidova",
        phone: "+998 95 789 01 23",
        age: 7,
        gender: "Ayol",
        diagnosis: "Sut tishining qimirlashi",
        toothNumber: "61",
        serviceId: "S-5",
        serviceName: "Tishni og'riqsiz sug'urish (Ekstraktsiya)",
        doctor: "Dr. Madina Qodirova",
        appointmentDate: "2026-08-08 15:00",
        totalAmount: 250000,
        paidAmount: 250000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Og'riqsiz tez sug'urib olindi.",
        createdAt: "2026-08-06"
    },
    {
        id: "DENT-097",
        fullName: "Rustam Bekmurodov",
        phone: "+998 90 890 12 34",
        age: 27,
        gender: "Erkak",
        diagnosis: "Distopik aql tishi",
        toothNumber: "48",
        serviceId: "S-6",
        serviceName: "Aql tishini murakkab jarrohlik olish",
        doctor: "Dr. Bobur Ergashev",
        appointmentDate: "2026-08-05 09:30",
        totalAmount: 700000,
        paidAmount: 700000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Jarrohlik muvaffaqiyatli yakunlandi.",
        createdAt: "2026-08-03"
    },
    {
        id: "DENT-098",
        fullName: "Azizbek Jo'rayev",
        phone: "+998 93 901 23 45",
        age: 36,
        gender: "Erkak",
        diagnosis: "Tish emali yupqalashishi, estetik tiklash",
        toothNumber: "12",
        serviceId: "S-8",
        serviceName: "Sirkoniy tojburchak (Zirconia)",
        doctor: "Dr. Nilufar Saidova",
        appointmentDate: "2026-08-02 12:00",
        totalAmount: 2200000,
        paidAmount: 2200000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Sirkoniy tojburchak o'rnatildi.",
        createdAt: "2026-07-29"
    },
    // ==========================================
    // 2026-YIL IYUL OYI HISOBOTLARI (Namunaviy)
    // ==========================================
    {
        id: "DENT-081",
        fullName: "Shohruh Normatov",
        phone: "+998 90 111 44 77",
        age: 40,
        gender: "Erkak",
        diagnosis: "Tish ildizi yallig'lanishi, tish yo'qotilishi",
        toothNumber: "46",
        serviceId: "S-9",
        serviceName: "Dental Implant o'rnatish (Osstem)",
        doctor: "Dr. Bobur Ergashev",
        appointmentDate: "2026-07-29 10:00",
        totalAmount: 4500000,
        paidAmount: 4500000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Implant o'rnatildi.",
        createdAt: "2026-07-25"
    },
    {
        id: "DENT-082",
        fullName: "Malika Ibrohimova",
        phone: "+998 93 222 55 88",
        age: 31,
        gender: "Ayol",
        diagnosis: "Pulpit va ildiz kanallari davolash",
        toothNumber: "14",
        serviceId: "S-4",
        serviceName: "Pulpit va Kanal davolash (Endodontiya)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-07-22 14:00",
        totalAmount: 650000,
        paidAmount: 650000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Muolaja to'liq yakunlandi.",
        createdAt: "2026-07-19"
    },
    {
        id: "DENT-083",
        fullName: "Nodir Zokirov",
        phone: "+998 97 333 66 99",
        age: 28,
        gender: "Erkak",
        diagnosis: "Tish toshlari va milk qonashi",
        toothNumber: "Barcha tishlar",
        serviceId: "S-2",
        serviceName: "Tish tozalash & Oqartirish (Air Flow)",
        doctor: "Dr. Nilufar Saidova",
        appointmentDate: "2026-07-18 11:30",
        totalAmount: 300000,
        paidAmount: 300000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Tish toshlari tozalab berildi.",
        createdAt: "2026-07-15"
    },
    {
        id: "DENT-084",
        fullName: "Feruza Axmedova",
        phone: "+998 99 444 77 11",
        age: 35,
        gender: "Ayol",
        diagnosis: "Tish kariesi",
        toothNumber: "26",
        serviceId: "S-3",
        serviceName: "Kariesni davolash (Fotopolimer plomba)",
        doctor: "Dr. Ahmadbek Karimov",
        appointmentDate: "2026-07-14 16:00",
        totalAmount: 450000,
        paidAmount: 450000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Plomba o'rnatildi.",
        createdAt: "2026-07-11"
    },
    {
        id: "DENT-085",
        fullName: "Otabek G'aniyev",
        phone: "+998 91 555 88 22",
        age: 48,
        gender: "Erkak",
        diagnosis: "Tish qobig'i sinishi",
        toothNumber: "22",
        serviceId: "S-7",
        serviceName: "Metall-keramika tojburchak (Koronka)",
        doctor: "Dr. Bobur Ergashev",
        appointmentDate: "2026-07-09 15:00",
        totalAmount: 1200000,
        paidAmount: 1200000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Tojburchak kiygizildi.",
        createdAt: "2026-07-06"
    },
    {
        id: "DENT-086",
        fullName: "Zarina Yusupova",
        phone: "+998 95 666 99 33",
        age: 9,
        gender: "Ayol",
        diagnosis: "Sut tishi ekstraktsiyasi",
        toothNumber: "54",
        serviceId: "S-5",
        serviceName: "Tishni og'riqsiz sug'urish (Ekstraktsiya)",
        doctor: "Dr. Madina Qodirova",
        appointmentDate: "2026-07-03 10:30",
        totalAmount: 250000,
        paidAmount: 250000,
        status: "Tugatildi",
        paymentStatus: "To'langan",
        notes: "Bolalar anesteziyasi bilan tish olindi.",
        createdAt: "2026-07-01"
    }
];

// LocalStorage Helper Funksiyalari
const STORAGE_KEY_PATIENTS = "dentacare_patients_data";
const STORAGE_KEY_SERVICES = "dentacare_services_data";
const STORAGE_KEY_DOCTORS = "dentacare_doctors_data";

// 1. Bemorlar
function getPatientsFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY_PATIENTS);
    if (!data) {
        localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(initialPatients));
        return [...initialPatients];
    }
    try {
        let list = JSON.parse(data);
        if (!Array.isArray(list) || list.length === 0) {
            localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(initialPatients));
            return [...initialPatients];
        }
        // Oylik tahlil va solishtirish to'liq ishlashi uchun, agar bazada faqat 1 oy ma'lumotlari bo'lsa,
        // avvalgi oylar namunaviy arxiv ma'lumotlarini qo'shib beramiz (foydalanuvchi yangi qo'shganlari saqlanadi)
        const hasAugust = list.some(p => (p.appointmentDate || p.createdAt || "").includes("2026-08"));
        if (!hasAugust && list.length <= 10) {
            const historicalPatients = initialPatients.filter(p => 
                (p.appointmentDate || p.createdAt || "").includes("2026-08") || 
                (p.appointmentDate || p.createdAt || "").includes("2026-07")
            );
            list = [...list, ...historicalPatients];
            localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(list));
        }
        return list;
    } catch (e) {
        return [...initialPatients];
    }
}

function savePatientsToStorage(patientsList) {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patientsList));
    // Firebase bulutiga ham yuboramiz:
    if (window.savePatientsToFirebase) {
        window.savePatientsToFirebase(patientsList);
    }
}

// 2. Xizmat turlari
function getServicesFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY_SERVICES);
    if (!data) {
        localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(defaultServices));
        return [...defaultServices];
    }
    try {
        const list = JSON.parse(data);
        if (!Array.isArray(list) || list.length === 0) {
            localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(defaultServices));
            return [...defaultServices];
        }
        return list;
    } catch (e) {
        return [...defaultServices];
    }
}

function saveServicesToStorage(servicesList) {
    localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(servicesList));
    // Firebase bulutiga ham yuboramiz:
    if (window.saveServicesToFirebase) {
        window.saveServicesToFirebase(servicesList);
    }
}

// 3. Shifokorlar va ishchilar
function getDoctorsFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY_DOCTORS);
    if (!data) {
        localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(defaultDoctors));
        return [...defaultDoctors];
    }
    try {
        const list = JSON.parse(data);
        if (!Array.isArray(list) || list.length === 0) {
            localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(defaultDoctors));
            return [...defaultDoctors];
        }
        return list;
    } catch (e) {
        return [...defaultDoctors];
    }
}

function saveDoctorsToStorage(doctorsList) {
    localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(doctorsList));
    // Firebase bulutiga ham yuboramiz:
    if (window.saveDoctorsToFirebase) {
        window.saveDoctorsToFirebase(doctorsList);
    }
}
