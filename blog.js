/* ============================================
   WM Solutions - Blog Engine
============================================ */

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
// Format Date
// =========================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

// =========================
// Render Blog Posts
// =========================

(function renderBlog() {
    const container = document.getElementById("blog-container");
    if (!container || typeof blogPosts === "undefined") return;

    if (blogPosts.length === 0) {
        document.getElementById("no-results").style.display = "block";
        return;
    }

    container.innerHTML = blogPosts.map(function(post) {
        return `
            <a href="${escapeHtml(post.url)}" class="blog-card" data-category="${escapeHtml(post.category)}">
                <div class="blog-card-image">
                    <span class="blog-category">${escapeHtml(post.category)}</span>
                    <span class="blog-card-placeholder">${escapeHtml(post.icon || "</>")}</span>
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span>📅 ${formatDate(post.date)}</span>
                        <span>⏱ ${escapeHtml(post.readTime)}</span>
                    </div>
                    <h3>${escapeHtml(post.title)}</h3>
                    <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
                    <div class="blog-card-footer">
                        <span class="blog-read-more">Read Article →</span>
                        <span class="blog-read-time">${escapeHtml(post.readTime)}</span>
                    </div>
                </div>
            </a>
        `;
    }).join("");
})();


// =========================
// Mobile Menu
// =========================

(function initMobileMenu() {
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener("click", function() {
        const isOpen = navLinks.classList.toggle("active");
        menuBtn.setAttribute("aria-expanded", isOpen);
        menuBtn.textContent = isOpen ? "✕" : "☰";
    });
})();


// =========================
// Scroll Progress
// =========================

(function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    window.addEventListener("scroll", function() {
        const top = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const percent = height > 0 ? (top / height) * 100 : 0;
        bar.style.width = percent + "%";
    }, { passive: true });
})();


// =========================
// Theme Toggle
// =========================

(function initThemeToggle() {
    const savedTheme = localStorage.getItem("wm_theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
})();
// =========================
// Blog Cards Scroll Reveal
// =========================

(function initBlogCardReveal() {
    // الأنيميشن موجود في CSS، ده بس للتأكد إنه بيشتغل صح
    // مفيش حاجة إضافية مطلوبة
})();


// =========================
// Blog Filter by Category (Optional)
// =========================

(function initBlogCategories() {
        const cards = document.querySelectorAll(".blog-card");
        if (!cards.length) return;

        // اجمع كل الـ categories
        const categories = new Set();
        cards.forEach(function(card) {
            const cat = card.dataset.category;
            if (cat) categories.add(cat);
        });

        // لو عدد الـ categories أكثر من 2، أضف أزرار فلترة
        if (categories.size < 2) return;

        const blogSection = document.querySelector(".blog-section");
        const container = document.getElementById("blog-container");

        if (!blogSection || !container) return;

        // أنشئ حاوية الأزرار
        const filterBar = document.createElement("div");
        filterBar.className = "blog-filter-bar";
        filterBar.innerHTML = `
        <button class="filter-btn active" data-filter="all">All Articles</button>
        ${Array.from(categories).map(function (cat) {
            return `<button class="filter-btn" data-filter="${cat}">${cat}</button>`;
        }).join("")}
    `;

    filterBar.style.cssText = `
        max-width: 1200px;
        margin: 0 auto 40px;
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
    `;

    // ضع الأزرار قبل الـ container
    blogSection.insertBefore(filterBar, container);

    // Events
    const filterBtns = filterBar.querySelectorAll(".filter-btn");

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            cards.forEach(function (card, index) {
                const cat = card.dataset.category || "";

                if (filter === "all" || cat === filter) {
                    card.style.display = "";
                    card.style.animation = "none";
                    void card.offsetWidth;
                    card.style.animation = `blogCardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s forwards`;
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
})();