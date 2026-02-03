import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAppDispatch } from '../hooks/redux';
import { setSession } from '../features/auth/authSlice';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                dispatch(setSession(data.session));
                navigate('/');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-3 sm:px-4">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-xl border border-brand-secondary/20 backdrop-blur-sm">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        Sign in to continue to BlogApp
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm flex items-center justify-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-dark">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-brand-dark">
                                Password
                            </label>
                            {/* Forgot password link could go here */}
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-primary text-white py-3 sm:py-3.5 px-4 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-70 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transform duration-200 text-sm sm:text-base min-h-[44px]"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-600">
                    <p>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-brand-primary hover:text-brand-dark font-bold hover:underline transition-all"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
