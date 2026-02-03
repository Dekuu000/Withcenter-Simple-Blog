import { supabase } from './supabase';
import { Blog, Comment } from '../types';

export const blogApi = {
    async getBlogs(page: number = 1, limit: number = 10) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('blogs')
            .select('*, profiles(email, full_name, id)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data: data as unknown as Blog[], count };
    },

    async getBlogsByAuthor(authorId: string) {
        const { data, error, count } = await supabase
            .from('blogs')
            .select('*, profiles(email, full_name, id)', { count: 'exact' })
            .eq('author_id', authorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data as unknown as Blog[], count };
    },

    async getBlogById(id: string) {
        const { data, error } = await supabase
            .from('blogs')
            .select('*, profiles(email, full_name, id)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as unknown as Blog;
    },

    async createBlog(blog: {
        title: string;
        content: string;
        author_id: string;
        image_url?: string;
    }) {
        const { data, error } = await supabase.from('blogs').insert([blog]).select().single();

        if (error) throw error;
        return data as unknown as Blog;
    },

    async updateBlog(
        id: string,
        updates: { title?: string; content?: string; image_url?: string | null }
    ) {
        const { data, error } = await supabase
            .from('blogs')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as unknown as Blog;
    },

    async deleteBlog(id: string) {
        const { error } = await supabase.from('blogs').delete().eq('id', id);

        if (error) throw error;
        return id;
    },
};

// Storage API for image uploads
export const storageApi = {
    async uploadImage(file: File, bucket: 'blog-images' | 'comment-images'): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

        return data.publicUrl;
    },

    async deleteImage(url: string, bucket: 'blog-images' | 'comment-images') {
        // Extract filename from URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const { error } = await supabase.storage.from(bucket).remove([fileName]);

        if (error) throw error;
    },
};

// Comment API
export const commentApi = {
    async getCommentsByBlog(blogId: string) {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(email, full_name, id, avatar_url)')
            .eq('blog_id', blogId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as unknown as Comment[];
    },

    async createComment(comment: {
        content: string;
        image_url?: string;
        blog_id: string;
        author_id: string;
    }) {
        const { data, error } = await supabase
            .from('comments')
            .insert([comment])
            .select('*, profiles(email, full_name, id, avatar_url)')
            .single();

        if (error) throw error;
        return data as unknown as Comment;
    },

    async deleteComment(id: string) {
        const { error } = await supabase.from('comments').delete().eq('id', id);

        if (error) throw error;
        return id;
    },
};
