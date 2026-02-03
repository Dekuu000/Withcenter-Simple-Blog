import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';

// Defines the shape of the auth state
export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    session: null,
    loading: true,
    error: null,
};

// Async thunk to check current session on app load
export const checkSession = createAsyncThunk('auth/checkSession', async () => {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
});

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        setSession: (state, action: PayloadAction<Session | null>) => {
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkSession.fulfilled, (state, action) => {
                state.loading = false;
                state.session = action.payload;
                state.user = action.payload?.user ?? null;
            })
            .addCase(checkSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to check session';
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.session = null;
            });
    },
});

export const { setUser, setSession } = authSlice.actions;
export default authSlice.reducer;
