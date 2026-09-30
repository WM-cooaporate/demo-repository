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

    // إغلاق عند الضغط على رابط
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
        <article class="project-card">
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
                // تأخير بسيط لكل عنصر
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
    // Fallback: إظهار كل العناصر مباشرة
    revealElements.forEach(el => el.classList.add("show"));
}