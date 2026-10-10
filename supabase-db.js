/* ============================================
   WM Solutions - Supabase DB Operations
============================================ */

const SupaDB = {

    async getAllProjects() {
        const { data, error } = await wmSupabase
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
        const { data, error } = await wmSupabase
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

    async addProject(project) {
        const { data, error } = await wmSupabase
            .from("projects")
            .insert([project])
            .select();

        if (error) throw error;
        return data;
    },

    async updateProject(id, updates) {
        const { data, error } = await wmSupabase
            .from("projects")
            .update({...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select();

        if (error) throw error;
        return data;
    },

    async deleteProject(id) {
        const { error } = await wmSupabase
            .from("projects")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async uploadFile(file, folder = "") {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { data, error } = await wmSupabase.storage
            .from("projects")
            .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data: urlData } = wmSupabase.storage
            .from("projects")
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }
};

window.SupaDB = SupaDB;