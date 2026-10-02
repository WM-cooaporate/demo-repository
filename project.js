// =========================
// Get Project
// =========================

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

// ✅ حماية: التأكد من تحميل projects-data.js
const projectsList = (typeof projects !== "undefined") ? projects : [];

const project = projectsList.find(function(item) {
    return item.id === projectId;
});

const container = document.getElementById("project-details-container");

// =========================
// Escape HTML (حماية من XSS)
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
// Dynamic SEO
// =========================
function updateProjectSEO(project) {
    if (!project) return;

    document.title = project.seoTitle || project.title;

    const canonicalUrl =
        `https://wm-cooaporate.github.io/demo-repository/project.html?id=${encodeURIComponent(project.id)}`;

    const baseUrl = "https://wm-cooaporate.github.io/demo-repository/";

    // Description
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
        description = document.createElement("meta");
        description.setAttribute("name", "description");
        document.head.appendChild(description);
    }
    description.setAttribute("content", project.seoDescription || project.description);

    // Keywords
    setMetaName(
        "keywords",
        `WM Solutions, ${project.title}, ${project.type}, ${(project.technologies || []).join(", ")}, software development, Egypt`
    );

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    const imageUrl = new URL(project.image, window.location.href).href;

    // Open Graph
    setMetaProperty("og:title", project.seoTitle || project.title);
    setMetaProperty("og:description", project.seoDescription || project.description);
    setMetaProperty("og:url", canonicalUrl);
    setMetaProperty("og:image", imageUrl);
    setMetaProperty("og:image:alt", project.imageAlt || project.title);
    setMetaProperty("og:type", "article");
    setMetaProperty("og:site_name", "WM Solutions");

    // Twitter
    setMetaName("twitter:title", project.seoTitle || project.title);
    setMetaName("twitter:description", project.seoDescription || project.description);
    setMetaName("twitter:image", imageUrl);
    setMetaName("twitter:image:alt", project.imageAlt || project.title);
    setMetaName("twitter:card", "summary_large_image");

    // Breadcrumb List
    createBreadcrumbSchema(project, canonicalUrl);

    // CreativeWork Schema
    createProjectSchema(project, canonicalUrl, imageUrl);
}


// =========================
// Breadcrumb Schema
// =========================

function createBreadcrumbSchema(project, canonicalUrl) {
    const oldSchema = document.getElementById("breadcrumb-schema");
    if (oldSchema) oldSchema.remove();

    const schema = document.createElement("script");
    schema.id = "breadcrumb-schema";
    schema.type = "application/ld+json";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://wm-cooaporate.github.io/demo-repository/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Projects",
                "item": "https://wm-cooaporate.github.io/demo-repository/#projects"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": project.title,
                "item": canonicalUrl
            }
        ]
    };

    schema.textContent = JSON.stringify(schemaData);
    document.head.appendChild(schema);
}
// =========================
// Meta Helpers
// =========================

function setMetaProperty(property, content) {
    if (!content) return;

    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
}

function setMetaName(name, content) {
    if (!content) return;

    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
}

// =========================
// Structured Data
// =========================
function createProjectSchema(project, canonicalUrl, imageUrl) {
    const oldSchema = document.getElementById("project-schema");
    if (oldSchema) oldSchema.remove();

    const schema = document.createElement("script");
    schema.id = "project-schema";
    schema.type = "application/ld+json";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": canonicalUrl,
        "name": project.title,
        "headline": project.title,
        "description": project.seoDescription || project.description,
        "url": canonicalUrl,
        "image": {
            "@type": "ImageObject",
            "url": imageUrl,
            "width": 1200,
            "height": 630
        },
        "creator": {
            "@type": "Organization",
            "@id": "https://wm-cooaporate.github.io/demo-repository/#organization",
            "name": "WM Solutions",
            "url": "https://wm-cooaporate.github.io/demo-repository/"
        },
        "publisher": {
            "@type": "Organization",
            "@id": "https://wm-cooaporate.github.io/demo-repository/#organization",
            "name": "WM Solutions",
            "logo": {
                "@type": "ImageObject",
                "url": "https://wm-cooaporate.github.io/demo-repository/images/logo.png"
            }
        },
        "keywords": (project.technologies || []).join(", "),
        "genre": project.type,
        "inLanguage": "en-US",
        "isAccessibleForFree": true,
        "datePublished": "2026-01-01",
        "dateModified": new Date().toISOString().split("T")[0]
    };

    schema.textContent = JSON.stringify(schemaData);
    document.head.appendChild(schema);
}
// =========================
// Render Project
// =========================

if (!container) {
    console.error("Project details container not found.");
} else if (!project) {
    document.title = "Project Not Found | WM Solutions";

    container.innerHTML = `
        <div class="project-not-found">
            <h1>Project Not Found</h1>
            <p>Sorry, this project does not exist.</p>
            <a href="index.html#projects">← Back to Projects</a>
        </div>
    `;
} else {
    // SEO
    updateProjectSEO(project);

    // Logo Detection
    const isLogoProject = project.isLogo === true;
    const mainImageClass = isLogoProject ?
        "project-main-image logo-image" :
        "project-main-image";

    // Technologies
    const technologiesHtml = (project.technologies || [])
        .map(tech => `<span>${escapeHtml(tech)}</span>`)
        .join("");

    // Screenshots
    const screenshotsHtml = (project.screenshots || [])
        .map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(project.title)} screenshot ${index + 1}"
                    loading="lazy"
                >
                <div class="gallery-overlay">Click to View</div>
            </div>
        `)
        .join("");

    // Video Section
    let videoHtml = "";
    if (project.video && project.video !== "#") {
        videoHtml = `
            <section class="project-section">
                <h2>Project Demo</h2>
                <div class="project-video">
                    <video controls preload="metadata" playsinline>
                        <source src="${escapeHtml(project.video)}" type="video/mp4">
                        Your browser does not support video playback.
                    </video>
                </div>
            </section>
        `;
    }

    // Actions
    let actionsHtml = "";
    const hasDemo = project.demo && project.demo !== "#";
    const hasGithub = project.github && project.github !== "#";

    if (hasDemo || hasGithub) {
        actionsHtml = `
            <div class="project-actions">
                ${hasDemo ? `
                    <a href="${escapeHtml(project.demo)}" target="_blank"
                       rel="noopener noreferrer" class="btn primary-btn">
                        Live Demo
                    </a>
                ` : ""}
                ${hasGithub ? `
                    <a href="${escapeHtml(project.github)}" target="_blank"
                       rel="noopener noreferrer" class="btn secondary-btn">
                        GitHub
                    </a>
                ` : ""}
            </div>
        `;
    }

    container.innerHTML = `
        <!-- Project Header -->
        <div class="project-details-header">
            <p class="project-type">${escapeHtml(project.type)}</p>
            <h1>${escapeHtml(project.title)}</h1>
            ${project.description ? `
                <p class="project-description">${escapeHtml(project.description)}</p>
            ` : ""}
        </div>

        <!-- Main Image -->
        <div class="${mainImageClass}">
            <img
                src="${escapeHtml(project.image)}"
                alt="${escapeHtml(project.imageAlt || project.title)}"
                fetchpriority="high"
            >
        </div>

        <!-- Technologies -->
        <section class="project-section project-technologies">
            <h2>Technologies Used</h2>
            <div class="project-tech">${technologiesHtml}</div>
        </section>

        <!-- Screenshots -->
        <section class="project-section project-screenshots-section">
            <h2>Project Screenshots</h2>
            <div class="project-gallery">${screenshotsHtml}</div>
        </section>

        ${videoHtml}
        ${actionsHtml}
    `;
}

// =========================
// Lightbox
// =========================

// ✅ التأكد من وجود المشروع قبل بناء الـ lightbox
if (project && project.screenshots && project.screenshots.length > 0) {

    const galleryItems = document.querySelectorAll(".gallery-item");

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");

    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close image viewer">×</button>
        <button class="lightbox-prev" aria-label="Previous image">‹</button>
        <img class="lightbox-image" src="" alt="">
        <button class="lightbox-next" aria-label="Next image">›</button>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const closeButton = lightbox.querySelector(".lightbox-close");
    const prevButton = lightbox.querySelector(".lightbox-prev");
    const nextButton = lightbox.querySelector(".lightbox-next");

    let currentImageIndex = 0;
    let lastFocusedElement = null;

    function openLightbox(index) {
        currentImageIndex = index;
        lastFocusedElement = document.activeElement;

        lightboxImage.src = project.screenshots[currentImageIndex];
        lightboxImage.alt = `${project.title} screenshot ${currentImageIndex + 1}`;

        lightbox.classList.add("active");
        document.body.classList.add("lightbox-open");

        // ✅ focus على زر الإغلاق للـ accessibility
        setTimeout(() => closeButton.focus(), 100);
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.classList.remove("lightbox-open");

        // ✅ إرجاع الـ focus
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function showPreviousImage() {
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = project.screenshots.length - 1;
        }
        lightboxImage.src = project.screenshots[currentImageIndex];
        lightboxImage.alt = `${project.title} screenshot ${currentImageIndex + 1}`;
    }

    function showNextImage() {
        currentImageIndex++;
        if (currentImageIndex >= project.screenshots.length) {
            currentImageIndex = 0;
        }
        lightboxImage.src = project.screenshots[currentImageIndex];
        lightboxImage.alt = `${project.title} screenshot ${currentImageIndex + 1}`;
    }

    galleryItems.forEach(function (item) {
        item.addEventListener("click", function () {
            const index = Number(item.dataset.index);
            openLightbox(index);
        });
    });

    closeButton.addEventListener("click", closeLightbox);
    prevButton.addEventListener("click", showPreviousImage);
    nextButton.addEventListener("click", showNextImage);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
        if (!lightbox.classList.contains("active")) return;

        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showPreviousImage();
        if (event.key === "ArrowRight") showNextImage();
    });

    // ✅ Swipe support للموبايل
    let touchStartX = 0;
    lightbox.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", function (e) {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) showNextImage();
            else showPreviousImage();
        }
    }, { passive: true });
}
// =========================
// Smart Back Button
// =========================

(function initSmartBack() {
    const backBtn = document.getElementById("back-to-projects");
    if (!backBtn) return;

    backBtn.addEventListener("click", function (e) {
        // لو المستخدم جاي من الموقع
        if (document.referrer && document.referrer.includes(window.location.host)) {
            e.preventDefault();
            window.history.back();
        }
    });
})();
// =========================
// Smart Back Button
// =========================

(function initSmartBack() {
    const backBtn = document.getElementById("back-to-projects");
    if (!backBtn) return;

    backBtn.addEventListener("click", function (e) {
        if (document.referrer && document.referrer.includes(window.location.host)) {
            e.preventDefault();
            window.history.back();
        }
    });
})();


// =========================
// Gallery Scroll Reveal (للمشاريع الكتير)
// =========================

(function initGalleryReveal() {
    if (!("IntersectionObserver" in window)) return;

    const galleryItems = document.querySelectorAll(".gallery-item");
    if (!galleryItems.length) return;

    // لو عدد الصور كبير، فعّل الـ scroll reveal
    if (galleryItems.length <= 9) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    galleryItems.forEach(function (item, index) {
        // إلغاء الأنيميشن التلقائي للصور اللي بعد الـ 9
        if (index >= 9) {
            item.style.animation = "none";
            item.style.opacity = "0";
            observer.observe(item);
        }
    });
})();


// =========================
// Scroll Progress Bar (لصفحة المشروع)
// =========================

(function initScrollProgress() {
    // لو مفيش عنصر، ننشئه
    let bar = document.getElementById("project-scroll-progress");

    if (!bar) {
        bar = document.createElement("div");
        bar.id = "project-scroll-progress";
        bar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            width: 0;
            background: linear-gradient(90deg, #5cc8ff, #22c55e, #f472b6);
            z-index: 10000;
            transition: width 0.1s linear;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
        `;
        document.body.appendChild(bar);
    }

    window.addEventListener("scroll", function () {
        const top = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const percent = height > 0 ? (top / height) * 100 : 0;
        bar.style.width = percent + "%";
    }, { passive: true });
})();


// =========================
// Image Lazy Load with Fade In
// =========================

(function initImageFade() {
    const images = document.querySelectorAll(".gallery-item img, .project-main-image img");

    images.forEach(function (img) {
        // لو الصورة اتحملت خلاص
        if (img.complete) {
            img.style.opacity = "1";
            return;
        }

        img.style.opacity = "0";
        img.style.transition = "opacity 0.5s ease";

        img.addEventListener("load", function () {
            img.style.opacity = "1";
        });

        img.addEventListener("error", function () {
            img.style.opacity = "0.5";
        });
    });
})();


// =========================
// Click Ripple Effect on Gallery
// =========================

(function initGalleryRipple() {
    const galleryItems = document.querySelectorAll(".gallery-item");

    galleryItems.forEach(function (item) {
        item.addEventListener("click", function (e) {
            const ripple = document.createElement("span");

            const rect = item.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(56, 189, 248, 0.4);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: rippleExpand 0.6s ease-out;
                pointer-events: none;
                z-index: 10;
            `;

            item.appendChild(ripple);

            setTimeout(function () {
                ripple.remove();
            }, 600);
        });
    });
})();