import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogApi } from '../../services/api';
import { Blog } from '../../types';

export interface BlogState {
    blogs: Blog[];
    currentBlog: Blog | null;
    loading: boolean;
    error: string | null;
    totalCount: number;
}

const initialState: BlogState = {
    blogs: [],
    currentBlog: null,
    loading: false,
    error: null,
    totalCount: 0,
};

// Async Thunks
export const fetchBlogs = createAsyncThunk(
    'blog/fetchBlogs',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
        return await blogApi.getBlogs(page, limit);
    }
);

export const fetchBlogsByAuthor = createAsyncThunk(
    'blog/fetchBlogsByAuthor',
    async (authorId: string) => {
        return await blogApi.getBlogsByAuthor(authorId);
    }
);

export const fetchBlogById = createAsyncThunk(
    'blog/fetchBlogById',
    async (id: string) => {
        return await blogApi.getBlogById(id);
    }
);

export const createBlog = createAsyncThunk(
    'blog/createBlog',
    async (blog: { title: string; content: string; author_id: string; image_url?: string }) => {
        return await blogApi.createBlog(blog);
    }
);

export const updateBlog = createAsyncThunk(
    'blog/updateBlog',
    async ({ id, title, content, image_url }: { id: string; title: string; content: string; image_url?: string | null }) => {
        return await blogApi.updateBlog(id, { title, content, image_url });
    }
);

export const deleteBlog = createAsyncThunk(
    'blog/deleteBlog',
    async (id: string) => {
        return await blogApi.deleteBlog(id);
    }
);

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Blogs
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = action.payload.data || [];
                state.totalCount = action.payload.count || 0;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch blogs';
            })
            // Fetch Single Blog
            .addCase(fetchBlogsByAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogsByAuthor.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = action.payload.data || [];
                state.totalCount = action.payload.count || 0;
            })
            .addCase(fetchBlogsByAuthor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch author blogs';
            })
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBlog = action.payload;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch blog';
            })
            // Create Blog
            .addCase(createBlog.fulfilled, (state, action) => {
                state.blogs.unshift(action.payload);
            })
            // Update Blog
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.currentBlog = action.payload;
                const index = state.blogs.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.blogs[index] = action.payload;
                }
            })
            // Delete Blog
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.blogs = state.blogs.filter(b => b.id !== action.payload);
                if (state.currentBlog?.id === action.payload) {
                    state.currentBlog = null;
                }
            });
    },
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;
