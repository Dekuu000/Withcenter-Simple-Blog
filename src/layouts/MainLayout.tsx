import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { checkSession, logoutUser, setSession } from '../features/auth/authSlice';
import { supabase } from '../services/supabase';
import UserProfileMenu from '../components/UserProfileMenu';

export default function MainLayout() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Initial session check
        dispatch(checkSession());

        // Real-time auth state listener
        const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                dispatch(setSession(session));
            } else {
                // We don't dispatch setSession(null) here because checkSession or logout handles it, 
                // and we want to avoid overwriting state during the initial check race condition.
                // However, for 'SIGNED_OUT' event specifically, we might want to.
                // For simplicity, let's rely on checkSession for init, and this for updates.
                // Actually, the most robust way is to dispatch setSession always when it changes.
                dispatch(setSession(session));
            }
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, [dispatch]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10 shrink-0">
                <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
                    <Link to="/" className="text-xl font-bold text-indigo-600 shrink-0">
                        BlogApp
                    </Link>
                    <nav className="flex items-center gap-2 sm:gap-4">
                        {user ? (
                            <>
                                <UserProfileMenu user={user} onLogout={handleLogout} />
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-2 py-1">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header >

            <main className="flex-grow w-full py-8">
                <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full flex flex-col h-full">
                    <Outlet />
                </div>
            </main>
        </div >
    );
}
