/* ============================================
   WM Solutions - Main Script (Supabase)
============================================ */


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
// Escape HTML
// =========================

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================
// Render Projects
// =========================

function renderProjects(projectsList) {
    const projectsContainer = document.getElementById("projects-container");
    if (!projectsContainer) return;

    console.log("🎨 Rendering", projectsList.length, "projects");

    if (!projectsList || projectsList.length === 0) {
        projectsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-muted);">
                <div style="font-size: 60px; font-family: 'Courier New', monospace; color: var(--border); margin-bottom: 20px;">&lt;/&gt;</div>
                <h3 style="font-size: 22px; color: var(--text-primary); margin-bottom: 10px;">No projects yet</h3>
            </div>
        `;
        return;
    }

    projectsContainer.innerHTML = projectsList.map(function(project) {
                return `
            <article class="project-card" data-type="${escapeHtml(project.type)}">
                <div class="project-image">
                    <img
                        src="${escapeHtml(project.image)}"
                        alt="${escapeHtml(project.title)}"
                        loading="lazy"
                        onerror="this.style.opacity='0.3';this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22%235cc8ff%22%3E%26lt;/%26gt;%3C/text%3E%3C/svg%3E';"
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
                    <a href="project.html?id=${encodeURIComponent(project.id)}" class="project-link">
                        View Project →
                    </a>
                </div>
            </article>
        `;
    }).join("");

    applyPortfolioFilter();
    applyScrollReveal();
}


// =========================
// Portfolio Filter
// =========================

function applyPortfolioFilter() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(function(btn) {
        if (btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";

        btn.addEventListener("click", function() {
            filterBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            const filter = btn.dataset.filter;

            projectCards.forEach(function(card) {
                const cardType = card.dataset.type || "";
                if (filter === "all" || cardType.includes(filter)) {
                    card.classList.remove("filtered-out");
                } else {
                    card.classList.add("filtered-out");
                }
            });
        });
    });
}


// =========================
// Scroll Reveal
// =========================

function applyScrollReveal() {
    const revealElements = document.querySelectorAll(
        ".service-card, .project-card, .team-card, .contact-info"
    );

    if (revealElements.length === 0) return;

    if (!("IntersectionObserver" in window)) {
        revealElements.forEach(el => el.classList.add("show"));
        return;
    }

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("show"), index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    revealElements.forEach(el => observer.observe(el));

    setTimeout(function() {
        revealElements.forEach(el => el.classList.add("show"));
    }, 2000);
}


// =========================
// Stats Counter
// =========================

(function initStatsCounter() {
    const statNumbers = document.querySelectorAll(".stat-number");
    if (!statNumbers.length) return;

    let hasAnimated = false;

    function animateCount(el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || "";
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target + suffix;
        }

        requestAnimationFrame(update);
    }

    if (!("IntersectionObserver" in window)) {
        statNumbers.forEach(animateCount);
        return;
    }

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                statNumbers.forEach((el, i) => setTimeout(() => animateCount(el), i * 150));
                observer.disconnect();
            }
        });
    }, { threshold: 0.4 });

    const statsSection = document.getElementById("stats");
    if (statsSection) observer.observe(statsSection);
})();


// =========================
// FAQ Toggle
// =========================

(function initFaqToggle() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(function(item) {
        item.addEventListener("toggle", function() {});
    });
})();


// =========================
// Update Stats
// =========================

function updateStatsFromProjects(projectsList) {
    const projectsEl = document.querySelector('[data-auto="projects"]');
    if (projectsEl && Array.isArray(projectsList)) {
        projectsEl.dataset.target = projectsList.length;
    }

    const techEl = document.querySelector('[data-auto="tech"]');
    if (techEl && Array.isArray(projectsList)) {
        const techSet = new Set();
        projectsList.forEach(function(p) {
            if (Array.isArray(p.technologies)) {
                p.technologies.forEach(t => techSet.add(t.toLowerCase().trim()));
            }
        });
        techEl.dataset.target = techSet.size;
    }

    const statsSection = document.getElementById("stats");
    if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            document.querySelectorAll(".stat-number").forEach(function(el) {
                const target = parseInt(el.dataset.target, 10) || 0;
                const suffix = el.dataset.suffix || "";
                el.textContent = target + suffix;
            });
        }
    }
}


// =========================
// MAIN: Load Projects from Supabase
// =========================

(async function loadProjectsMain() {
    const projectsContainer = document.getElementById("projects-container");
    if (!projectsContainer) return;

    console.log("🔍 Loading projects from Supabase...");

    try {
        const projectsList = await SupaDB.getAllProjects();
        console.log("📂 Loaded:", projectsList.length, "projects");

        renderProjects(projectsList);
        updateStatsFromProjects(projectsList);

        console.log("✅ Projects rendered:", projectsList.length);
    } catch (err) {
        console.error("❌ Error:", err);
        renderProjects([]);
    }
})();


// =========================
// Auto-Refresh on Focus
// =========================

(function autoRefreshOnFocus() {
    let lastFocus = Date.now();

    window.addEventListener("focus", async function() {
        if (Date.now() - lastFocus > 2000) {
            console.log("🔄 Refreshing...");
            try {
                const fresh = await SupaDB.getAllProjects();
                renderProjects(fresh);
                updateStatsFromProjects(fresh);
            } catch (e) {
                console.error(e);
            }
        }
        lastFocus = Date.now();
    });
})();