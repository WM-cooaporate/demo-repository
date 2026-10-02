/* ============================================
   WM Solutions - Animations Engine
============================================ */ // =========================
// 1. Boot Screen - يظهر مرة واحدة بس في السيشن
// =========================
(function initBootScreen() {
    const bootScreen = document.getElementById("boot-screen");
    if (!bootScreen) return;

    const hasBooted = sessionStorage.getItem("wm_booted");

    if (hasBooted) {
        bootScreen.style.display = "none";
        return;
    }

    sessionStorage.setItem("wm_booted", "true");

    function hideBoot() {
        bootScreen.classList.add("hidden");
        setTimeout(() => {
            bootScreen.style.display = "none";
        }, 700);
    }

    setTimeout(hideBoot, 3000);
})();
// =========================
// 2. Scroll Progress Bar
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
// 3. Code Rain (Hero Background)
// =========================
(function initCodeRain() {
    const container = document.getElementById("code-rain");
    if (!container) return;

    const snippets = [
        "const", "let", "async", "await", "=>", "{ }",
        "</>", "[ ]", "return", "if", "for", "while",
        "class", "import", "export", "try", "catch",
        "npm", "git", "sudo", "0x1F", "&&", "||"
    ];

    for (let i = 0; i < 15; i++) {
        const span = document.createElement("span");
        span.textContent = snippets[Math.floor(Math.random() * snippets.length)];
        span.style.left = Math.random() * 100 + "%";
        span.style.animationDuration = (Math.random() * 8 + 10) + "s";
        span.style.animationDelay = (Math.random() * 12) + "s";
        span.style.fontSize = (Math.random() * 6 + 11) + "px";
        span.style.color = Math.random() > 0.5 ? "#0284c7" : "#16a34a";
        container.appendChild(span);
    }
})();


// =========================
// 4. Matrix Rain
// =========================
(function initMatrix() {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    let width, height, columns, drops;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / 20);
        drops = new Array(columns).fill(1);
    }

    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコ";
    const fontSize = 14;

    function draw() {
        ctx.fillStyle = "rgba(2, 6, 23, 0.1)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#0284c7";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 20, drops[i] * fontSize);

            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let interval = null;

    function start() {
        if (interval) return;
        interval = setInterval(draw, 70);
    }

    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    document.addEventListener("visibilitychange", function() {
        if (document.hidden) stop();
        else start();
    });

    start();
})();


// =========================
// 5. Section Reveal
// =========================
(function initSectionReveal() {
    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll("section").forEach(s => s.classList.add("revealed"));
        return;
    }

    const sections = document.querySelectorAll("main > section");

    sections.forEach(function(section, index) {
        section.classList.add("reveal-section");

        if (index > 0 && !section.querySelector(".section-tag")) {
            const tag = document.createElement("div");
            tag.className = "section-tag";

            const names = {
                "about": "about",
                "services": "services",
                "projects": "projects",
                "contact": "contact"
            };

            tag.innerHTML = `<span>&lt;section: ${names[section.id] || section.id} /&gt;</span>`;
            section.style.position = "relative";
            section.appendChild(tag);
        }
    });

    const observer = new IntersectionObserver(
        function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                } else {
                    entry.target.classList.remove("revealed");
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    sections.forEach(s => observer.observe(s));
})();


// =========================
// 6. Binary Divider
// =========================
(function initBinaryDivider() {
    const divider = document.querySelector(".binary-divider");
    if (!divider) return;

    const text = "01010111 01001101 00100000 01010011 01101111 01101100 01110101 01110100 01101001 01101111 01101110 01110011&nbsp;&nbsp;&nbsp;&nbsp;";

    divider.innerHTML = `<div class="binary-divider-inner">${text.repeat(4)}</div>`;
})();


// =========================
// 7. Floating Code Rotation
// =========================
(function rotateFloating() {
    const floaters = document.querySelectorAll(".floating-code");
    if (!floaters.length) return;

    const snippets = [
        '<span class="code-pink">const</span> build = <span class="code-green">()</span> =&gt; 🚀',
        '<span class="code-purple">npm</span> run <span class="code-green">deploy</span>',
        '<span class="code-pink">while</span>(alive) { code(); }',
        '<span class="code-green">git</span> push origin <span class="code-pink">main</span>',
        '<span class="code-purple">async</span> () =&gt; <span class="code-pink">await</span> magic()',
        '<span class="code-pink">return</span> <span class="code-green">"success"</span>;'
    ];

    let index = 0;

    setInterval(function() {
        index = (index + 1) % snippets.length;
        const target = floaters[Math.floor(Math.random() * floaters.length)];
        target.style.opacity = "0";

        setTimeout(function() {
            target.innerHTML = snippets[index];
            target.style.opacity = "1";
        }, 400);
    }, 7000);
})();