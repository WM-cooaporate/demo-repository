/* ============================================
   WM Solutions - Theme Toggle
============================================ */

(function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem("wm_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        updateAriaLabel("light");
    } else if (savedTheme === "dark") {
        document.body.classList.remove("light-mode");
        updateAriaLabel("dark");
    } else if (!prefersDark) {
        document.body.classList.add("light-mode");
        updateAriaLabel("light");
    } else {
        updateAriaLabel("dark");
    }

    toggleBtn.addEventListener("click", function() {
        toggleBtn.classList.add("toggling");
        setTimeout(() => toggleBtn.classList.remove("toggling"), 700);

        const isLight = document.body.classList.toggle("light-mode");
        localStorage.setItem("wm_theme", isLight ? "light" : "dark");
        updateAriaLabel(isLight ? "light" : "dark");
    });

    function updateAriaLabel(mode) {
        toggleBtn.setAttribute(
            "aria-label",
            mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
        );
    }
})();
// =========================
// Fallback: إذا لم يوجد .theme-icon-dark
// =========================

(function ensureThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    // لو الزر مش فيه .theme-toggle-inner، ضيفه
    if (!toggleBtn.querySelector(".theme-toggle-inner")) {
        toggleBtn.innerHTML = `
            <span class="theme-toggle-inner">
                <span class="theme-icon theme-icon-dark" aria-hidden="true">&lt;/&gt;</span>
                <span class="theme-icon theme-icon-light" aria-hidden="true">☀</span>
            </span>
        `;
    }
})();