// Stomatologiya CRM - Minimalist Login
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const alertBox = document.getElementById("loginAlert");
    const loginBtn = document.getElementById("loginBtn");

    // Tilni boshqarish
    let currentLang = localStorage.getItem("dentacare_app_lang") || "uz";
    const btnUz = document.getElementById("btnLoginLangUz");
    const btnRu = document.getElementById("btnLoginLangRu");

    const texts = {
        uz: {
            title: "Stomatologiya | Kirish",
            loginPlaceholder: "Login",
            passPlaceholder: "Parol",
            btnSubmit: "Kirish",
            submitting: "Kirilmoqda...",
            emptyAlert: "Iltimos, login va parolni kiriting!",
            wrongAlert: "Login yoki parol noto'g'ri!"
        },
        ru: {
            title: "Стоматология | Вход",
            loginPlaceholder: "Логин",
            passPlaceholder: "Пароль",
            btnSubmit: "Войти",
            submitting: "Вход в систему...",
            emptyAlert: "Пожалуйста, введите логин и пароль!",
            wrongAlert: "Неверный логин или пароль!"
        }
    };

    function applyLoginLang(lang) {
        currentLang = lang;
        localStorage.setItem("dentacare_app_lang", lang);
        document.title = texts[lang].title;

        if (btnUz && btnRu) {
            btnUz.classList.toggle("active", lang === "uz");
            btnRu.classList.toggle("active", lang === "ru");
        }

        if (usernameInput) usernameInput.placeholder = texts[lang].loginPlaceholder;
        if (passwordInput) passwordInput.placeholder = texts[lang].passPlaceholder;
        if (loginBtn) loginBtn.textContent = texts[lang].btnSubmit;
    }

    if (btnUz) btnUz.addEventListener("click", () => applyLoginLang("uz"));
    if (btnRu) btnRu.addEventListener("click", () => applyLoginLang("ru"));
    applyLoginLang(currentLang);

    // Foydalanuvchi tizimga kirgan bo'lsa dashboardga yo'naltirish
    const currentUser = localStorage.getItem("dentacare_current_user");
    if (currentUser) {
        window.location.href = "index.html";
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim().toLowerCase();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showAlert(texts[currentLang].emptyAlert);
                return;
            }

            // Tizimga kirish: ahmad / 1234
            if (username === "ahmad" && password === "1234") {
                loginBtn.disabled = true;
                loginBtn.textContent = texts[currentLang].submitting;

                // Mavjud bosh shifokor ma'lumotlarini tekshirish
                let chiefFullName = "Dr. Ahmadbek Karimov";
                let chiefAvatar = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";
                try {
                    const doctorsData = localStorage.getItem("dentacare_doctors_data");
                    if (doctorsData) {
                        const parsedDocs = JSON.parse(doctorsData);
                        if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
                            const chief = parsedDocs.find(d => d.id === "DOC-1") || parsedDocs[0];
                            if (chief && chief.name) chiefFullName = chief.name;
                            if (chief && chief.avatar) chiefAvatar = chief.avatar;
                        }
                    }
                } catch (e) {}

                const userData = {
                    username: "ahmad",
                    fullName: chiefFullName,
                    role: "Bosh shifokor",
                    clinic: "DentaCare Stomatologiya",
                    avatar: chiefAvatar,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem("dentacare_current_user", JSON.stringify(userData));

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 500);
            } else {
                showAlert(texts[currentLang].wrongAlert);
                passwordInput.value = "";
                passwordInput.focus();
            }
        });
    }

    function showAlert(message) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.classList.remove("d-none");

        setTimeout(() => {
            alertBox.classList.add("d-none");
        }, 3500);
    }
});
