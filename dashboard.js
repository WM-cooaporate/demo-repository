/* ============================================
   WM Solutions - Dashboard Logic (Supabase)
============================================ */

(function() {
    "use strict";

    let allProjects = [];
    let editingId = null;
    let deletingId = null;
    let currentTech = [];
    let currentGallery = [];

    const $ = function(sel) { return document.querySelector(sel); };

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
    // Load Projects
    // =========================

    async function loadProjects() {
        try {
            allProjects = await SupaDB.getAllProjects();
            renderProjects(allProjects);
            updateStats();
        } catch (err) {
            console.error(err);
            showToast("❌ Error loading projects", "error");
        }
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
                        <p class="dash-card-desc">${escapeHtml(p.description || "")}</p>
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
    // Grid Actions
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
    // Open Editor
    // =========================

    async function openEditor(id) {
        editingId = id || null;

        if (id) {
            try {
                const project = await SupaDB.getProject(id);
                if (!project) {
                    showToast("Project not found", "error");
                    return;
                }
                fillForm(project);
                modalTitleEl.textContent = "Edit Project";
            } catch (err) {
                console.error(err);
                showToast("Error loading project", "error");
                return;
            }
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
        $("#field-seo-title").value = p.seo_title || "";
        $("#field-seo-description").value = p.seo_description || "";
        $("#field-image").value = p.image || "";
        $("#field-video").value = p.video || "";
        $("#field-is-logo").checked = !!p.is_logo;

        if (p.image) {
            $("#preview-main").innerHTML = `<img src="${escapeHtml(p.image)}" alt="preview">`;
        } else {
            $("#preview-main").innerHTML = "";
        }

        if (p.video && p.video !== "#") {
            $("#preview-video").innerHTML = `<video src="${escapeHtml(p.video)}" controls></video>`;
        } else {
            $("#preview-video").innerHTML = "";
        }

        currentTech = (p.technologies || []).slice();
        renderTechTags();

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

        const id = $("#field-id").value.trim();
        const title = $("#field-title").value.trim();

        if (!id) {
            showToast("❌ Project ID is required", "error");
            $("#field-id").focus();
            return;
        }

        if (!title) {
            showToast("❌ Project Title is required", "error");
            $("#field-title").focus();
            return;
        }

        if (!editingId) {
            try {
                const exists = await SupaDB.getProject(id);
                if (exists) {
                    showToast("❌ This ID is already used", "error");
                    return;
                }
            } catch (err) {}
        }

        const project = {
            id: id,
            title: title,
            type: $("#field-type").value.trim() || "Other",
            description: $("#field-description").value.trim() || "A project by WM Solutions.",
            seo_title: $("#field-seo-title").value.trim() || (title + " | WM Solutions"),
            seo_description: $("#field-seo-description").value.trim() || $("#field-description").value.trim(),
            image: $("#field-image").value.trim() || "images/logo.png",
            video: $("#field-video").value.trim() || "#",
            is_logo: $("#field-is-logo").checked,
            technologies: currentTech.slice(),
            screenshots: currentGallery.slice()
        };

        try {
            if (editingId) {
                await SupaDB.updateProject(editingId, project);
                showToast("✅ Project updated");
            } else {
                await SupaDB.addProject(project);
                showToast("✅ Project added");
            }

            closeEditor();
            await loadProjects();
        } catch (err) {
            console.error(err);
            showToast("❌ Error saving project", "error");
        }
    });

    // =========================
    // Delete
    // =========================

    async function openDeleteConfirm(id) {
        try {
            const p = await SupaDB.getProject(id);
            if (!p) return;

            deletingId = id;
            confirmTitleEl.textContent = p.title;
            confirmModalEl.style.display = "flex";
        } catch (err) {
            console.error(err);
        }
    }

    $("#btn-cancel-delete").addEventListener("click", function() {
        confirmModalEl.style.display = "none";
        deletingId = null;
    });

    $("#btn-confirm-delete").addEventListener("click", async function() {
        if (!deletingId) return;

        try {
            await SupaDB.deleteProject(deletingId);
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

    setupUpload("upload-main", "file-main", async function(file) {
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            showToast("Image too large (max 3MB)", "error");
            return;
        }

        showToast("⏳ Uploading...");

        try {
            const url = await SupaDB.uploadFile(file, "main");
            $("#field-image").value = url;
            $("#preview-main").innerHTML = `<img src="${url}" alt="preview">`;
            showToast("✅ Image uploaded");
        } catch (err) {
            console.error(err);
            showToast("❌ Upload failed", "error");
        }
    }, false);

    setupUpload("upload-gallery", "file-gallery", async function(files) {
        showToast("⏳ Uploading " + files.length + " images...");

        for (const file of files) {
            if (file.size > 3 * 1024 * 1024) {
                showToast("Skipping " + file.name + " (too large)", "error");
                continue;
            }

            try {
                const url = await SupaDB.uploadFile(file, "screenshots");
                currentGallery.push(url);
            } catch (err) {
                console.error(err);
            }
        }

        renderGalleryPreview();
        showToast("✅ Images uploaded");
    }, true);

    setupUpload("upload-video", "file-video", async function(file) {
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) {
            showToast("Video too large (max 100MB)", "error");
            return;
        }

        showToast("⏳ Uploading video...");

        try {
            const url = await SupaDB.uploadFile(file, "videos");
            $("#field-video").value = url;
            $("#preview-video").innerHTML = `<video src="${url}" controls></video>`;
            showToast("✅ Video uploaded");
        } catch (err) {
            console.error(err);
            showToast("❌ Upload failed", "error");
        }
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

    $("#btn-export").addEventListener("click", function() {
        const data = {
            exportedAt: new Date().toISOString(),
            projects: allProjects
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "wm-projects-" + new Date().toISOString().split("T")[0] + ".json";
        a.click();
        URL.revokeObjectURL(url);

        showToast("✅ Exported " + allProjects.length + " projects");
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

            for (const p of data.projects) {
                try {
                    await SupaDB.addProject(p);
                } catch (err) {
                    console.error("Skipping:", p.id, err);
                }
            }

            showToast("✅ Imported projects");
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
        } catch (e) {}
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
    // Init
    // =========================

    (async function init() {
        try {
            await loadProjects();
            showToast("✅ Dashboard ready");
        } catch (err) {
            console.error("Init error:", err);
            showToast("❌ Error loading data", "error");
        }
    })();

})();