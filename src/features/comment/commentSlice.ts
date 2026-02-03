import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentApi } from '../../services/api';
import { Comment } from '../../types';

export interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchComments = createAsyncThunk(
    'comment/fetchComments',
    async (blogId: string) => {
        return await commentApi.getCommentsByBlog(blogId);
    }
);

export const createComment = createAsyncThunk(
    'comment/createComment',
    async (comment: { content: string; image_url?: string; blog_id: string; author_id: string }) => {
        return await commentApi.createComment(comment);
    }
);

export const deleteComment = createAsyncThunk(
    'comment/deleteComment',
    async (id: string) => {
        return await commentApi.deleteComment(id);
    }
);

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        clearComments: (state) => {
            state.comments = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Comments
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            })
            // Create Comment
            .addCase(createComment.fulfilled, (state, action) => {
                state.comments.push(action.payload);
            })
            // Delete Comment
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter(c => c.id !== action.payload);
            });
    },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
