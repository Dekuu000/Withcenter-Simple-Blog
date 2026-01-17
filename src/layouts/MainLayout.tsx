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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                        BlogApp
                    </Link>
                    <nav className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/create-blog" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                                    Write
                                </Link>
                                <UserProfileMenu user={user} onLogout={handleLogout} />
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header >

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col">
                <Outlet />
            </main>
        </div >
    );
}
