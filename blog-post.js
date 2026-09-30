/* ============================================
   WM Solutions - Blog Post Page
============================================ */

// =========================
// Get Post ID
// =========================

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const postsList = (typeof blogPosts !== "undefined") ? blogPosts : [];

const post = postsList.find(function(item) {
    return item.id === postId;
});

const container = document.getElementById("blog-post-container");

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
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

// =========================
// Render Post or Not Found
// =========================

if (!container) {
    console.error("Blog post container not found");
} else if (!post) {
    document.title = "Article Not Found | WM Solutions";
    container.innerHTML = `
    <article class="blog-post">
        <!-- Back Link -->
        <a href="blog.html" class="blog-post-back">
        <div class="post-not-found">
            <h1>404</h1>
            <h2>Article Not Found</h2>
            <p>Sorry, this article doesn't exist or has been removed.</p>
            <a href="blog.html" class="btn primary-btn">← Back to Blog</a>
        </div>
    `;
} else {
    // SEO updates
    document.title = post.title + " | WM Solutions Blog";

    const setMeta = (selector, content) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', post.excerpt);
    setMeta('meta[property="og:title"]', post.title);
    setMeta('meta[property="og:description"]', post.excerpt);
    setMeta('meta[name="twitter:title"]', post.title);
    setMeta('meta[name="twitter:description"]', post.excerpt);

    // Render full post
    container.innerHTML = `
        <article class="blog-post">

            <!-- Back Link -->
            <a href="blog.html" class="blog-post-back">
                <span class="back-arrow">←</span>
                <span>Back to All Articles</span>
            </a>

            <!-- Article Header -->
            <header class="blog-post-header">

                <div class="blog-post-meta-top">
                    <span class="blog-post-category">${escapeHtml(post.category)}</span>
                </div>

                <h1 class="blog-post-title">${escapeHtml(post.title)}</h1>

                <div class="blog-post-meta">
                    <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${formatDate(post.date)}
                    </span>
                    <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${escapeHtml(post.readTime)}
                    </span>
                    <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        WM Solutions
                    </span>
                </div>

            </header>

            <!-- Article Content -->
            <div class="blog-post-content">
                ${post.content || "<p>" + escapeHtml(post.excerpt) + "</p>"}
            </div>

            <!-- CTA -->
            <div class="blog-post-cta">
                <h3>Have a project in mind?</h3>
                <p>Let's build something great together.</p>
                <a href="index.html#contact" class="btn primary-btn">Contact Us</a>
            </div>

        </article>
    `;
}


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

    navLinks.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
            navLinks.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.textContent = "☰";
        });
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

(function initTheme() {
    const savedTheme = localStorage.getItem("wm_theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
})();
// =========================
// Scroll Reveal for Content
// =========================

(function initContentReveal() {
    if (!("IntersectionObserver" in window)) return;

    const elements = document.querySelectorAll(
        ".blog-post-content h2, .blog-post-content h3, .blog-post-content ul"
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    elements.forEach(function(el) {
        observer.observe(el);
    });
})();


// =========================
// Reading Progress Percentage
// =========================

(function initReadingProgress() {
    const container = document.querySelector(".blog-post-container");
    if (!container) return;

    // أضف مؤشر نسبة القراءة
    const indicator = document.createElement("div");
    indicator.className = "reading-indicator";
    indicator.innerHTML = `
        <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#1e293b" stroke-width="3"/>
            <circle cx="22" cy="22" r="18" fill="none" stroke="#38bdf8" stroke-width="3"
                    stroke-dasharray="113"
                    stroke-dashoffset="113"
                    transform="rotate(-90 22 22)"
                    class="reading-circle"/>
        </svg>
        <span class="reading-percent">0%</span>
    `;

    indicator.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 25px;
        width: 44px;
        height: 44px;
        z-index: 998;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(indicator);

    const circle = indicator.querySelector(".reading-circle");
    const percentText = indicator.querySelector(".reading-percent");

    // Style للنص
    percentText.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #38bdf8;
        font-size: 10px;
        font-weight: bold;
        font-family: "Courier New", monospace;
    `;

    window.addEventListener("scroll", function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;

        const dashOffset = 113 - (113 * percent / 100);
        circle.style.strokeDashoffset = dashOffset;
        percentText.textContent = Math.round(percent) + "%";

        // إظهار المؤشر عند التمرير
        if (scrollTop > 400) {
            indicator.style.opacity = "1";
        } else {
            indicator.style.opacity = "0";
        }
    }, { passive: true });
})();


// =========================
// Copy Code Snippets
// =========================

(function initCopyCode() {
    const codeBlocks = document.querySelectorAll(".blog-post-content code");

    codeBlocks.forEach(function(code) {
        code.style.cursor = "pointer";
        code.title = "Click to copy";

        code.addEventListener("click", function() {
            const text = code.textContent;

            navigator.clipboard.writeText(text).then(function() {
                const original = code.textContent;
                code.textContent = "✓ Copied!";
                code.style.color = "#22c55e";

                setTimeout(function() {
                    code.textContent = original;
                    code.style.color = "";
                }, 1000);
            });
        });
    });
})();