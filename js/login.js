// Stomatologiya CRM - Minimalist Login
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const alertBox = document.getElementById("loginAlert");
    const loginBtn = document.getElementById("loginBtn");

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
                showAlert("Iltimos, login va parolni kiriting!");
                return;
            }

            // Tizimga kirish: ahmad / 1234
            if (username === "ahmad" && password === "1234") {
                loginBtn.disabled = true;
                loginBtn.textContent = "Kirilmoqda...";

                const userData = {
                    username: "ahmad",
                    fullName: "Dr. Ahmadbek Karimov",
                    role: "Bosh shifokor",
                    clinic: "DentaCare Stomatologiya",
                    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem("dentacare_current_user", JSON.stringify(userData));

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 500);
            } else {
                showAlert("Login yoki parol noto'g'ri!");
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
