/* ============================================
   WM Solutions - Login Logic
   Secured with SHA-256 hashing
============================================ */

(function() {
    "use strict";

    // =========================
    // ⚙️ الإعدادات — غيّر هنا
    // =========================

    // 🔐 بيانات الدخول (Username + Hashed Password)
    // الباسورد الأصلي: Solutions
    // الهاش ده اتحسب بـ SHA-256 مع Salt

    const SALT = "wm_solutions_2026_secret";

    const USERS = [{
        username: "WM_Solutions",
        // Hash of: "Solutions" + SALT
        passwordHash: "ca17bdb9907407fca40c24eab47bb6f8377df763872e64dafbee7f2bd4e476e3"
    }];

    // ⏱️ مدة الجلسة (بالساعات)
    const SESSION_HOURS = 24;

    // =========================
    // 🔒 SHA-256 Helper
    // =========================

    async function sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // =========================
    // حساب الـ Hash (مرة واحدة)
    // =========================

    async function prepareUsers() {
        for (const user of USERS) {
            // لو الباسورد الأصلي موجود، احسب له hash
            if (user.passwordRaw) {
                user.passwordHash = await sha256(user.passwordRaw + SALT);
                delete user.passwordRaw; // امسح الباسورد الأصلي
            }
        }
    }

    // =========================
    // Session Key
    // =========================

    const SESSION_KEY = "wm_dashboard_session";

    // =========================
    // إذا كان مسجل دخول مسبقاً → روح للداشبورد
    // =========================

    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.expires > Date.now()) {
                window.location.href = "dashboard.html";
                return;
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        } catch (e) {
            localStorage.removeItem(SESSION_KEY);
        }
    }

    // =========================
    // Elements
    // =========================

    const form = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("login-error");
    const submitBtn = form.querySelector("button[type=submit]");

    // =========================
    // Handle Login
    // =========================

    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Hide error
        errorBox.style.display = "none";

        // Validate
        if (!username || !password) {
            showError("Please fill in all fields");
            return;
        }

        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ Checking...";

        try {
            // Prepare users (compute hashes if needed)
            await prepareUsers();

            // Compute hash of entered password
            const enteredHash = await sha256(password + SALT);

            // Find user
            const user = USERS.find(function(u) {
                return u.username === username && u.passwordHash === enteredHash;
            });

            if (!user) {
                showError("Invalid username or password");
                passwordInput.value = "";
                passwordInput.focus();
                submitBtn.disabled = false;
                submitBtn.textContent = "🔓 Login";
                return;
            }

            // ✅ Success — Save session
            const sessionData = {
                username: user.username,
                loginAt: Date.now(),
                expires: Date.now() + SESSION_HOURS * 60 * 60 * 1000
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

            submitBtn.textContent = "✓ Logging in...";

            // Redirect
            setTimeout(function() {
                window.location.href = "dashboard.html";
            }, 400);

        } catch (err) {
            console.error("Login error:", err);
            showError("An error occurred. Please try again.");
            submitBtn.disabled = false;
            submitBtn.textContent = "🔓 Login";
        }
    });

    // =========================
    // Show Error
    // =========================

    function showError(msg) {
        errorBox.textContent = "⚠️ " + msg;
        errorBox.style.display = "block";
        errorBox.style.animation = "none";
        void errorBox.offsetWidth;
        errorBox.style.animation = "errorShake 0.4s ease";
    }

})();