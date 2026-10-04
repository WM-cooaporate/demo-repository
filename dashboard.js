/* ============================================
   WM Solutions - Dashboard Logic
============================================ */

(function() {
    "use strict";

    // =========================
    // State
    // =========================

    let allProjects = [];
    let editingId = null;
    let deletingId = null;
    let currentTech = [];
    let currentGallery = [];

    // =========================
    // DOM Refs
    // =========================

    const $ = function(sel) { return document.querySelector(sel); };
    const $$ = function(sel) { return document.querySelectorAll(sel); };

    const gridEl = $("#projects-grid");
    const emptyEl = $("#empty-state");
    const searchEl = $("#search-input");
    const modalEl = $("#editor-modal");
    const formEl = $("#project-form");
    const modalTitleEl = $("#modal-title");

    const confirmModalEl = $("#confirm-modal");
    const confirmTitleEl = $("#confirm-project-title");

    const toastEl = $("#toast");

    // =========================
    // Toast
    // =========================

    function showToast(msg, type) {
        type = type || "success";
        toastEl.textContent = msg;
        toastEl.className = "dash-toast " + type + " show";

        clearTimeout(showToast._t);
        showToast._t = setTimeout(function() {
            toastEl.classList.remove("show");
        }, 3000);
    }

    // =========================
    // ESC
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
    // Seed from projects-data.js
    // =========================

    async function seedFromDataFile() {
        const seeded = await WM_DB.isSeeded();
        if (seeded) return;

        // لو projects-data.js موجود
        if (typeof projects !== "undefined" && Array.isArray(projects) && projects.length > 0) {
            await WM_DB.open();

            for (const p of projects) {
                await WM_DB.addProject(p);
            }

            await WM_DB.markSeeded();
            showToast("✅ Imported " + projects.length + " projects from data file");
        }
    }

    // =========================
    // Load Projects
    // =========================

    async function loadProjects() {
        allProjects = await WM_DB.getAllProjects();
        // Sort by createdAt (newest first)
        allProjects.sort(function(a, b) {
            return (b.createdAt || 0) - (a.createdAt || 0);
        });
        renderProjects(allProjects);
        updateStats();
    }

    // =========================
    // Update Stats
    // =========================

    function updateStats() {
        $("#stat-total").textContent = allProjects.length;

        const web = allProjects.filter(function(p) {
            return (p.type || "").toLowerCase().includes("web");
        }).length;

        const mobile = allProjects.filter(function(p) {
            return (p.type || "").toLowerCase().includes("mobile") ||
                (p.type || "").toLowerCase().includes("app");
        }).length;

        const desktop = allProjects.filter(function(p) {
            return (p.type || "").toLowerCase().includes("desktop");
        }).length;

        $("#stat-web").textContent = web;
        $("#stat-mobile").textContent = mobile;
        $("#stat-desktop").textContent = desktop;
    }

    // =========================
    // Render Projects
    // =========================

    function renderProjects(list) {
        if (!list.length) {
            gridEl.innerHTML = "";
            emptyEl.style.display = "block";
            return;
        }

        emptyEl.style.display = "none";

        gridEl.innerHTML = list.map(function(p) {
            const image = p.image ?
                `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">` :
                `&lt;/&gt;`;

            const techs = (p.technologies || []).slice(0, 3).map(function(t) {
                return `<span class="dash-card-tech">${escapeHtml(t)}</span>`;
            }).join("");

            const techMore = (p.technologies || []).length > 3 ?
                `<span class="dash-card-tech">+${p.technologies.length - 3}</span>` :
                "";

            return `
                <article class="dash-card" data-id="${escapeHtml(p.id)}">
                    <div class="dash-card-image">
                        <span class="dash-card-badge">${escapeHtml(p.type || "Other")}</span>
                        ${image}
                    </div>
                    <div class="dash-card-body">
                        <h3 class="dash-card-title">${escapeHtml(p.title)}</h3>
                        <p class="dash-card-desc">${escapeHtml(p.description)}</p>
                        <div class="dash-card-techs">
                            ${techs}
                            ${techMore}
                        </div>
                    </div>
                    <div class="dash-card-actions">
                        <a href="project.html?id=${encodeURIComponent(p.id)}" target="_blank" class="dash-btn dash-btn-secondary">
                            👁 View
                        </a>
                        <button class="dash-btn dash-btn-secondary" data-action="edit" data-id="${escapeHtml(p.id)}">
                            ✏️ Edit
                        </button>
                        <button class="dash-btn dash-btn-danger" data-action="delete" data-id="${escapeHtml(p.id)}">
                            🗑
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    // =========================
    // Search
    // =========================

    searchEl.addEventListener("input", function(e) {
        const q = e.target.value.trim().toLowerCase();
        if (!q) {
            renderProjects(allProjects);
            return;
        }

        const filtered = allProjects.filter(function(p) {
            return (
                (p.title || "").toLowerCase().includes(q) ||
                (p.description || "").toLowerCase().includes(q) ||
                (p.type || "").toLowerCase().includes(q) ||
                (p.technologies || []).some(function(t) {
                    return t.toLowerCase().includes(q);
                })
            );
        });

        renderProjects(filtered);
    });

    // =========================
    // Grid Actions (Edit/Delete)
    // =========================

    gridEl.addEventListener("click", async function(e) {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === "edit") {
            openEditor(id);
        } else if (action === "delete") {
            openDeleteConfirm(id);
        }
    });

    // =========================
    // Open Editor (Add / Edit)
    // =========================

    async function openEditor(id) {
        editingId = id || null;

        if (id) {
            const project = await WM_DB.getProject(id);
            if (!project) {
                showToast("Project not found", "error");
                return;
            }
            fillForm(project);
            modalTitleEl.textContent = "Edit Project";
        } else {
            formEl.reset();
            clearFormExtras();
            modalTitleEl.textContent = "Add New Project";
        }

        modalEl.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeEditor() {
        modalEl.style.display = "none";
        document.body.style.overflow = "";
        editingId = null;
        formEl.reset();
        clearFormExtras();
    }

    // =========================
    // Fill Form
    // =========================

    function fillForm(p) {
        $("#field-id").value = p.id || "";
        $("#field-title").value = p.title || "";
        $("#field-type").value = p.type || "";
        $("#field-description").value = p.description || "";
        $("#field-seo-title").value = p.seoTitle || "";
        $("#field-seo-description").value = p.seoDescription || "";
        $("#field-image").value = p.image || "";
        $("#field-video").value = p.video || "";
        $("#field-demo").value = p.demo || "";
        $("#field-github").value = p.github || "";
        $("#field-is-logo").checked = !!p.isLogo;

        // Preview main image
        if (p.image) {
            $("#preview-main").innerHTML = `<img src="${escapeHtml(p.image)}" alt="preview">`;
        } else {
            $("#preview-main").innerHTML = "";
        }

        // Preview video
        if (p.video && p.video !== "#") {
            $("#preview-video").innerHTML = `<video src="${escapeHtml(p.video)}" controls></video>`;
        } else {
            $("#preview-video").innerHTML = "";
        }

        // Tech
        currentTech = (p.technologies || []).slice();
        renderTechTags();

        // Gallery
        currentGallery = (p.screenshots || []).slice();
        renderGalleryPreview();
    }

    function clearFormExtras() {
        currentTech = [];
        currentGallery = [];
        renderTechTags();
        renderGalleryPreview();
        $("#preview-main").innerHTML = "";
        $("#preview-video").innerHTML = "";
        $("#field-id").readOnly = false;
    }

    // =========================
    // Save
    // =========================

    formEl.addEventListener("submit", async function(e) {
        e.preventDefault();

        const id = $("#field-id").value.trim().toLowerCase();

        if (!id) {
            showToast("Project ID is required", "error");
            return;
        }

        // تحقق من ID
        if (!/^[a-z0-9\-]+$/.test(id)) {
            showToast("ID must be lowercase letters, numbers, and dashes only", "error");
            return;
        }

        // تحقق من عدم التكرار (لو جديد)
        if (!editingId) {
            const exists = await WM_DB.getProject(id);
            if (exists) {
                showToast("This ID is already used", "error");
                return;
            }
        }

        const project = {
            id: id,
            title: $("#field-title").value.trim(),
            type: $("#field-type").value,
            description: $("#field-description").value.trim(),
            seoTitle: $("#field-seo-title").value.trim() || ($("#field-title").value.trim() + " | WM Solutions"),
            seoDescription: $("#field-seo-description").value.trim() || $("#field-description").value.trim(),
            image: $("#field-image").value.trim(),
            imageAlt: $("#field-title").value.trim() + " by WM Solutions",
            video: $("#field-video").value.trim() || "#",
            demo: $("#field-demo").value.trim() || "#",
            github: $("#field-github").value.trim() || "#",
            isLogo: $("#field-is-logo").checked,
            technologies: currentTech.slice(),
            screenshots: currentGallery.slice(),
            createdAt: editingId ? (await WM_DB.getProject(editingId)).createdAt : Date.now(),
            updatedAt: Date.now()
        };

        try {
            if (editingId) {
                await WM_DB.updateProject(project);
                showToast("✅ Project updated");
            } else {
                await WM_DB.addProject(project);
                showToast("✅ Project added");
            }

            closeEditor();
            await loadProjects();
        } catch (err) {
            console.error(err);
            showToast("Error saving project", "error");
        }
    });

    // =========================
    // Delete
    // =========================

    async function openDeleteConfirm(id) {
        const p = await WM_DB.getProject(id);
        if (!p) return;

        deletingId = id;
        confirmTitleEl.textContent = p.title;
        confirmModalEl.style.display = "flex";
    }

    $("#btn-cancel-delete").addEventListener("click", function() {
        confirmModalEl.style.display = "none";
        deletingId = null;
    });

    $("#btn-confirm-delete").addEventListener("click", async function() {
        if (!deletingId) return;

        try {
            await WM_DB.deleteProject(deletingId);
            confirmModalEl.style.display = "none";
            deletingId = null;
            showToast("🗑 Project deleted");
            await loadProjects();
        } catch (err) {
            console.error(err);
            showToast("Error deleting project", "error");
        }
    });

    // =========================
    // Tech Tags
    // =========================

    const techInput = $("#field-tech-input");

    techInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = techInput.value.trim();
            if (val && !currentTech.includes(val)) {
                currentTech.push(val);
                renderTechTags();
            }
            techInput.value = "";
        }
    });

    function renderTechTags() {
        const wrap = $("#tech-tags");
        wrap.innerHTML = currentTech.map(function(t, i) {
            return `
                <span class="dash-tag">
                    ${escapeHtml(t)}
                    <span class="dash-tag-remove" data-tech-index="${i}">×</span>
                </span>
            `;
        }).join("");
    }

    $("#tech-tags").addEventListener("click", function(e) {
        const btn = e.target.closest("[data-tech-index]");
        if (!btn) return;
        const i = parseInt(btn.dataset.techIndex, 10);
        currentTech.splice(i, 1);
        renderTechTags();
    });

    // =========================
    // Gallery Preview
    // =========================

    function renderGalleryPreview() {
        const wrap = $("#preview-gallery");
        wrap.innerHTML = currentGallery.map(function(img, i) {
            return `
                <div class="dash-gallery-item">
                    <img src="${escapeHtml(img)}" alt="screenshot ${i + 1}">
                    <button class="dash-gallery-remove" data-gallery-index="${i}" title="Remove">×</button>
                </div>
            `;
        }).join("");
    }

    $("#preview-gallery").addEventListener("click", function(e) {
        const btn = e.target.closest("[data-gallery-index]");
        if (!btn) return;
        const i = parseInt(btn.dataset.galleryIndex, 10);
        currentGallery.splice(i, 1);
        renderGalleryPreview();
    });

    // =========================
    // File Uploads
    // =========================

    function setupUpload(zoneId, inputId, handler, multiple) {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);

        zone.addEventListener("click", function() { input.click(); });

        zone.addEventListener("dragover", function(e) {
            e.preventDefault();
            zone.classList.add("dragover");
        });

        zone.addEventListener("dragleave", function() {
            zone.classList.remove("dragover");
        });

        zone.addEventListener("drop", function(e) {
            e.preventDefault();
            zone.classList.remove("dragover");
            if (e.dataTransfer.files.length) {
                handler(multiple ? Array.from(e.dataTransfer.files) : e.dataTransfer.files[0]);
            }
        });

        input.addEventListener("change", function() {
            if (input.files.length) {
                handler(multiple ? Array.from(input.files) : input.files[0]);
                input.value = "";
            }
        });
    }

    // Main image
    setupUpload("upload-main", "file-main", async function(file) {
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            showToast("Image too large (max 3MB)", "error");
            return;
        }
        const base64 = await WM_DB.fileToBase64(file);
        $("#field-image").value = base64;
        $("#preview-main").innerHTML = `<img src="${base64}" alt="preview">`;
        showToast("✅ Image uploaded");
    }, false);

    // Gallery
    setupUpload("upload-gallery", "file-gallery", async function(files) {
        for (const file of files) {
            if (file.size > 3 * 1024 * 1024) {
                showToast("Skipping " + file.name + " (too large)", "error");
                continue;
            }
            const base64 = await WM_DB.fileToBase64(file);
            currentGallery.push(base64);
        }
        renderGalleryPreview();
        showToast("✅ " + files.length + " image(s) added");
    }, true);

    // Video
    setupUpload("upload-video", "file-video", async function(file) {
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            showToast("Video too large (max 20MB)", "error");
            return;
        }
        const base64 = await WM_DB.fileToBase64(file);
        $("#field-video").value = base64;
        $("#preview-video").innerHTML = `<video src="${base64}" controls></video>`;
        showToast("✅ Video uploaded");
    }, false);

    // =========================
    // Modal Buttons
    // =========================

    $("#btn-add-new").addEventListener("click", function() {
        openEditor(null);
    });

    $("#btn-modal-close").addEventListener("click", closeEditor);
    $("#btn-cancel").addEventListener("click", closeEditor);

    modalEl.querySelector(".dash-modal-backdrop").addEventListener("click", closeEditor);

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            if (modalEl.style.display === "flex") closeEditor();
            if (confirmModalEl.style.display === "flex") {
                confirmModalEl.style.display = "none";
                deletingId = null;
            }
        }
    });

    // =========================
    // Export / Import
    // =========================

    $("#btn-export").addEventListener("click", async function() {
        const data = await WM_DB.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "wm-projects-" + new Date().toISOString().split("T")[0] + ".json";
        a.click();
        URL.revokeObjectURL(url);

        showToast("✅ Exported " + data.projects.length + " projects");
    });

    $("#btn-import").addEventListener("click", function() {
        $("#import-file").click();
    });

    $("#import-file").addEventListener("change", async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.projects || !Array.isArray(data.projects)) {
                showToast("Invalid JSON format", "error");
                return;
            }

            const count = await WM_DB.importAll(data, { mode: "merge" });
            showToast("✅ Imported " + count + " projects");
            await loadProjects();
        } catch (err) {
            console.error(err);
            showToast("Error importing file", "error");
        }

        e.target.value = "";
    });
    // =========================
    // Get Current User
    // =========================

    (function showCurrentUser() {
        const badge = document.getElementById("user-badge");
        if (!badge) return;

        try {
            const session = JSON.parse(localStorage.getItem("wm_dashboard_session"));
            if (session && session.username) {
                badge.textContent = "👤 " + session.username;
            }
        } catch (e) { /* ignore */ }
    })();

    // =========================
    // Logout
    // =========================

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("wm_dashboard_session");
                window.location.href = "login.html";
            }
        });
    }

    // =========================
    // 🚀 Publish to Site
    // =========================

    const publishBtn = document.getElementById("btn-publish");
    if (publishBtn) {
        publishBtn.addEventListener("click", async function() {
            try {
                publishBtn.disabled = true;
                publishBtn.textContent = "⏳ Generating...";

                const allProjects = await WM_DB.getAllProjects();

                if (!allProjects.length) {
                    showToast("⚠️ No projects to publish", "error");
                    return;
                }

                // Sort by createdAt
                allProjects.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

                // Generate projects-data.js content
                const jsContent = generateProjectsDataFile(allProjects);

                // Download the file
                const blob = new Blob([jsContent], { type: "text/javascript" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "projects-data.js";
                a.click();
                URL.revokeObjectURL(url);

                // Show success modal
                showPublishModal(allProjects.length);

            } catch (err) {
                console.error(err);
                showToast("❌ Error generating file", "error");
            } finally {
                publishBtn.disabled = false;
                publishBtn.textContent = "🚀 Publish";
            }
        });
    }

    // =========================
    // Generate projects-data.js
    // =========================

    function generateProjectsDataFile(projects) {
        let output = `/* ============================================
   WM Solutions - Projects Data (Published)
   Generated: ${new Date().toISOString()}
   Total: ${projects.length} projects
============================================ */

const projects = [\n`;

        projects.forEach(function(p, index) {
            output += "\n    " + JSON.stringify(p, null, 4).replace(/\n/g, "\n    ");

            if (index < projects.length - 1) {
                output += ",";
            }
            output += "\n";
        });

        output += "\n];\n";

        return output;
    }

    // =========================
    // Publish Success Modal
    // =========================

    function showPublishModal(count) {
        // Remove old modal
        const old = document.getElementById("publish-modal");
        if (old) old.remove();

        const modal = document.createElement("div");
        modal.id = "publish-modal";
        modal.className = "dash-modal";
        modal.style.display = "flex";

        modal.innerHTML = `
        <div class="dash-modal-backdrop"></div>
        <div class="dash-modal-content" style="max-width: 560px;">
            <div class="dash-modal-header">
                <h2>✅ File Downloaded!</h2>
                <button class="dash-modal-close" id="close-publish-modal">×</button>
            </div>

            <div class="dash-modal-body">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 60px; margin-bottom: 12px;">📦</div>
                    <p style="font-size: 16px; color: #f1f5f9; margin: 0 0 8px;">
                        <strong>projects-data.js</strong> جاهز ب${count} مشروع
                    </p>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                        الملف اتحمّل في مجلد <strong>Downloads</strong>
                    </p>
                </div>

                <div style="background: #141d2e; border: 1px solid #2d3b4f; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                    <p style="font-size: 13px; color: #5cc8ff; font-weight: 700; margin: 0 0 12px;">
                        📋 الخطوات الجاية:
                    </p>
                    <ol style="color: #94a3b8; font-size: 13px; padding-left: 20px; margin: 0; line-height: 1.9;">
                        <li>روح لمجلد <strong style="color:#5cc8ff;">WM_Solutions</strong></li>
                        <li>استبدل <strong style="color:#5cc8ff;">projects-data.js</strong> القديم بالملف الجديد</li>
                        <li>اعمل <strong style="color:#5cc8ff;">Refresh</strong> للموقع (Ctrl + Shift + R)</li>
                        <li>المشاريع هتظهر في الصفحة الرئيسية ✅</li>
                    </ol>
                </div>

                <div class="dash-form-actions" style="border: none; padding: 0; margin: 0;">
                    <button type="button" class="dash-btn dash-btn-secondary" id="download-again-publish">
                        ⬇ حمّل الملف تاني
                    </button>
                    <button type="button" class="dash-btn dash-btn-primary" id="close-publish-modal-2">
                        👍 تمام
                    </button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        // Close handlers
        const closeBtn1 = modal.querySelector("#close-publish-modal");
        const closeBtn2 = modal.querySelector("#close-publish-modal-2");
        const backdrop = modal.querySelector(".dash-modal-backdrop");

        function closeModal() {
            modal.remove();
        }

        closeBtn1.addEventListener("click", closeModal);
        closeBtn2.addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);

        // Download again
        modal.querySelector("#download-again-publish").addEventListener("click", async function() {
            const allProjects = await WM_DB.getAllProjects();
            const jsContent = generateProjectsDataFile(allProjects);
            const blob = new Blob([jsContent], { type: "text/javascript" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "projects-data.js";
            a.click();
            URL.revokeObjectURL(url);

            showToast("✅ Downloaded again");
        });
    }

    // =========================
    // Init
    // =========================

    (async function init() {
        try {
            await WM_DB.open();
            await seedFromDataFile();
            await loadProjects();
        } catch (err) {
            console.error("Init error:", err);
            showToast("Error loading data", "error");
        }
    })();

})();