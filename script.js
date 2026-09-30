// =========================
// Mobile Menu
// =========================

const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function() {
        const isOpen = navLinks.classList.toggle("active");
        menuBtn.setAttribute("aria-expanded", isOpen);
        menuBtn.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.textContent = "☰";
        });
    });
}

// =========================
// Back To Top
// =========================

const backToTop = document.getElementById("back-to-top");

if (backToTop) {
    window.addEventListener("scroll", function() {
        if (window.scrollY > 400) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    }, { passive: true });

    backToTop.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// =========================
// Projects Rendering
// =========================

const projectsContainer = document.getElementById("projects-container");

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (projectsContainer && typeof projects !== "undefined") {
    projectsContainer.innerHTML = projects.map(project => `
    <article class="project-card" data-type="${escapeHtml(project.type)}">
            <div class="project-image">
                <img
                    src="${escapeHtml(project.image)}"
                    alt="${escapeHtml(project.imageAlt || project.title)}"
                    loading="lazy"
                >
            </div>
            <div class="project-content">
                <p class="project-type">${escapeHtml(project.type)}</p>
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="project-tech">
                    ${(project.technologies || [])
                        .slice(0, 4)
                        .map(t => `<span>${escapeHtml(t)}</span>`)
                        .join("")}
                </div>
                <a
                    href="project.html?id=${encodeURIComponent(project.id)}"
                    class="project-link"
                >
                    View Project →
                </a>
            </div>
        </article>
    `).join("");
}

// =========================
// Scroll Reveal Animation
// =========================

const revealElements = document.querySelectorAll(
    ".service-card, .project-card, .team-card, .contact-info"
);

if (revealElements.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add("show");
                }, index * 100);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
} else {
    revealElements.forEach(el => el.classList.add("show"));
}
// =========================
// Theme Toggle (Dark/Light)
// =========================

(function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector(".theme-icon");
    const savedTheme = localStorage.getItem("wm_theme");

    // طبّق الثيم المحفوظ
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        icon.textContent = "☀️";
    }

    toggleBtn.addEventListener("click", function () {
        const isLight = document.body.classList.toggle("light-mode");
        icon.textContent = isLight ? "☀️" : "🌙";
        localStorage.setItem("wm_theme", isLight ? "light" : "dark");

        // animation دائرية عند التبديل
        toggleBtn.style.transform = "rotate(360deg)";
        setTimeout(() => {
            toggleBtn.style.transform = "";
        }, 400);
    });
})();


// =========================
// Stats Counter
// =========================

(function initStatsCounter() {
    const statNumbers = document.querySelectorAll(".stat-number");
    if (!statNumbers.length) return;

    let hasAnimated = false;

    function animateCount(el) {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const eased = progress === 1
                ? 1
                : 1 - Math.pow(2, -10 * progress);

            const current = Math.floor(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    if (!("IntersectionObserver" in window)) {
        statNumbers.forEach(animateCount);
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                statNumbers.forEach(function (el, i) {
                    setTimeout(() => animateCount(el), i * 150);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.4 });

    const statsSection = document.getElementById("stats");
    if (statsSection) observer.observe(statsSection);
})();


// =========================
// Portfolio Filter
// =========================

(function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            // Update active state
            filterBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            const filter = btn.dataset.filter;

            projectCards.forEach(function (card, index) {
                const cardType = card.dataset.type || "";

                if (filter === "all" || cardType.includes(filter)) {
                    card.classList.remove("filtered-out");
                    // Re-trigger animation
                    card.style.animation = "none";
                    void card.offsetWidth;
                    card.style.animation = `galleryReveal 0.5s ease ${index * 0.08}s forwards`;
                } else {
                    card.classList.add("filtered-out");
                }
            });
        });
    });
})();


// =========================
// FAQ Analytics (Track Open)
// =========================

(function initFaqToggle() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(function (item) {
        item.addEventListener("toggle", function () {
            if (item.open) {
                // أغلق الباقي (اختياري - لو عايز واحد بس مفتوح)
                // faqItems.forEach(other => {
                //     if (other !== item) other.open = false;
                // });
            }
        });
    });
})();
// =========================
// Auto-Calculate Stats from Data
// =========================

(function autoCalcStats() {

    // ═══════════════════════════════════
    // 1. عدد المشاريع (من projects-data.js)
    // ═══════════════════════════════════

    const projectsEl = document.querySelector('[data-auto="projects"]');

    if (projectsEl && typeof projects !== "undefined" && Array.isArray(projects)) {
        // عدد المشاريع الحقيقي
        const projectCount = projects.length;

        // حدّث الـ data-target
        projectsEl.dataset.target = projectCount;

        // لو الـ counter لسه ما اشتغلش، هيعمل أنيميشن للرقم الجديد لما يوصل
    }


    // ═══════════════════════════════════
    // 2. عدد أعضاء الفريق (من HTML)
    // ═══════════════════════════════════

    const teamEl = document.querySelector('[data-auto="team"]');

    if (teamEl) {
        const teamCards = document.querySelectorAll(".team-card");
        if (teamCards.length > 0) {
            teamEl.dataset.target = teamCards.length;
        }
    }


    // ═══════════════════════════════════
    // 3. عدد التقنيات (من المشاريع)
    // ═══════════════════════════════════

    const techEl = document.querySelector('[data-auto="tech"]');

    if (techEl && typeof projects !== "undefined" && Array.isArray(projects)) {
        const techSet = new Set();

        projects.forEach(function (p) {
            if (Array.isArray(p.technologies)) {
                p.technologies.forEach(function (t) {
                    techSet.add(t.toLowerCase().trim());
                });
            }
        });

        techEl.dataset.target = techSet.size;
    }

})();