/* ============================================
   WM Solutions - IndexedDB Manager
============================================ */

const WM_DB = (function() {
    const DB_NAME = "wm_solutions_db";
    const DB_VERSION = 1;
    const STORE_PROJECTS = "projects";
    const STORE_SETTINGS = "settings";

    let dbInstance = null;

    // =========================
    // Open DB
    // =========================

    function open() {
        return new Promise(function(resolve, reject) {
            if (dbInstance) {
                resolve(dbInstance);
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function(event) {
                const db = event.target.result;

                // Projects Store
                if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                    const projectStore = db.createObjectStore(STORE_PROJECTS, {
                        keyPath: "id"
                    });
                    projectStore.createIndex("type", "type", { unique: false });
                    projectStore.createIndex("createdAt", "createdAt", { unique: false });
                }

                // Settings Store
                if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
                    db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
                }
            };

            request.onsuccess = function(event) {
                dbInstance = event.target.result;
                resolve(dbInstance);
            };

            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    }

    // =========================
    // Generic Helpers
    // =========================

    function tx(storeName, mode) {
        return open().then(function(db) {
            return db.transaction(storeName, mode).objectStore(storeName);
        });
    }

    // =========================
    // Projects - CRUD
    // =========================

    function getAllProjects() {
        return tx(STORE_PROJECTS, "readonly").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        });
    }

    function getProject(id) {
        return tx(STORE_PROJECTS, "readonly").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    function addProject(project) {
        return tx(STORE_PROJECTS, "readwrite").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.add(project);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    function updateProject(project) {
        return tx(STORE_PROJECTS, "readwrite").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.put(project);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    function deleteProject(id) {
        return tx(STORE_PROJECTS, "readwrite").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });
    }

    function countProjects() {
        return tx(STORE_PROJECTS, "readonly").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    // =========================
    // Settings
    // =========================

    function getSetting(key) {
        return tx(STORE_SETTINGS, "readonly").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result ? request.result.value : null);
                request.onerror = () => reject(request.error);
            });
        });
    }

    function setSetting(key, value) {
        return tx(STORE_SETTINGS, "readwrite").then(function(store) {
            return new Promise(function(resolve, reject) {
                const request = store.put({ key: key, value: value });
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });
    }

    // =========================
    // Export / Import
    // =========================

    function exportAll() {
        return getAllProjects().then(function(projects) {
            return {
                version: DB_VERSION,
                exportedAt: new Date().toISOString(),
                projects: projects
            };
        });
    }

    function importAll(data, options) {
        options = options || {};
        const mode = options.mode || "merge"; // merge | replace

        return open().then(function(db) {
            return new Promise(function(resolve, reject) {
                const transaction = db.transaction(STORE_PROJECTS, "readwrite");
                const store = transaction.objectStore(STORE_PROJECTS);

                if (mode === "replace") {
                    store.clear();
                }

                (data.projects || []).forEach(function(p) {
                    store.put(p);
                });

                transaction.oncomplete = () => resolve(data.projects.length);
                transaction.onerror = () => reject(transaction.error);
            });
        });
    }

    // =========================
    // File → Base64
    // =========================

    function fileToBase64(file) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // =========================
    // Check Seed Status
    // =========================

    function isSeeded() {
        return getSetting("seeded").then(function(v) {
            return v === true;
        });
    }

    function markSeeded() {
        return setSetting("seeded", true);
    }

    // =========================
    // Public API
    // =========================

    return {
        open: open,
        getAllProjects: getAllProjects,
        getProject: getProject,
        addProject: addProject,
        updateProject: updateProject,
        deleteProject: deleteProject,
        countProjects: countProjects,
        getSetting: getSetting,
        setSetting: setSetting,
        exportAll: exportAll,
        importAll: importAll,
        fileToBase64: fileToBase64,
        isSeeded: isSeeded,
        markSeeded: markSeeded
    };
})();