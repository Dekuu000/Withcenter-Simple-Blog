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
        <div className="min-h-screen bg-brand-bg text-brand-dark font-sans flex flex-col">
            <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-brand-secondary/30 sticky top-0 z-20 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
                    <Link to="/" className="text-2xl font-bold text-brand-primary tracking-tight hover:text-brand-dark transition-colors shrink-0">
                        BlogApp
                    </Link>

                    <nav className="flex items-center gap-3 sm:gap-6">
                        {user ? (
                            <UserProfileMenu user={user} onLogout={handleLogout} />
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-brand-dark hover:text-brand-primary px-2 transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-brand-primary hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-grow w-full py-10 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
