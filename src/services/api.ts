import { supabase } from './supabase';
import { Blog } from '../types';

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

    async createBlog(blog: { title: string; content: string; author_id: string }) {
        const { data, error } = await supabase
            .from('blogs')
            .insert([blog])
            .select()
            .single();

        if (error) throw error;
        return data as unknown as Blog;
    },

    async updateBlog(id: string, updates: { title?: string; content?: string }) {
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
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return id;
    }
};
