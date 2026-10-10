/* ============================================
   WM Solutions - Supabase Database Operations
============================================ */

const SupaDB = {

    // =========================
    // Projects - Read
    // =========================

    async getAllProjects() {
        const { data, error } = await window.supabaseClient
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading projects:", error);
            return [];
        }

        return data || [];
    },

    async getProject(id) {
        const { data, error } = await window.supabaseClient
            .from("projects")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error loading project:", error);
            return null;
        }

        return data;
    },

    // =========================
    // Projects - Write
    // =========================

    async addProject(project) {
        const { data, error } = await window.supabaseClient
            .from("projects")
            .insert([project])
            .select();

        if (error) throw error;
        return data;
    },

    async updateProject(id, updates) {
        const { data, error } = await window.supabaseClient
            .from("projects")
            .update({...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select();

        if (error) throw error;
        return data;
    },

    async deleteProject(id) {
        const { error } = await window.supabaseClient
            .from("projects")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    // =========================
    // Storage - Upload
    // =========================

    async uploadFile(file, folder = "") {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { data, error } = await window.supabaseClient.storage
            .from("projects")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = window.supabaseClient.storage
            .from("projects")
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    },

    async deleteFile(url) {
        if (!url || !url.includes("projects/")) return;

        // Extract file path from URL
        const filePath = url.split("/projects/")[1];
        if (!filePath) return;

        await window.supabaseClient.storage
            .from("projects")
            .remove([filePath]);
    }
};

window.SupaDB = SupaDB;