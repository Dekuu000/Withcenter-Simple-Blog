import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAppDispatch } from '../hooks/redux';
import { setSession } from '../features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';


export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Real-time password check
    const isPasswordMismatch = confirmPassword && password !== confirmPassword;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailInvalid = email && !emailRegex.test(email);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEmailInvalid) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Email confirmation disabled as per requirements
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                dispatch(setSession(data.session));
                navigate('/');
            } else if (data.user) {
                // Fallback if auto-login is disabled on server side, though "Email confirmation disabled" usually implies instant session
                // If confirm is OFF, we usually get a session immediately.
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-3 sm:px-4 py-8">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-xl border border-brand-secondary/20 backdrop-blur-sm">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mb-2">Create Account</h1>
                    <p className="text-sm sm:text-base text-gray-500">Join our community of writers today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm flex items-center justify-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-dark">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50/50 hover:bg-white text-sm sm:text-base ${isEmailInvalid
                                ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500'
                                : 'border-gray-200 focus:ring-brand-primary/20 focus:border-brand-primary'
                                }`}
                            placeholder="you@example.com"
                            required
                        />
                        {isEmailInvalid && (
                            <p className="mt-1 text-xs text-red-600 font-medium animate-fade-in pl-1">
                                Please enter a valid email address
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-dark">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-gray-50/50 hover:bg-white pr-10 sm:pr-12 text-sm sm:text-base"
                                placeholder="Min. 6 characters"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary focus:outline-none transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-dark">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 pr-10 sm:pr-12 transition-all bg-gray-50/50 hover:bg-white text-sm sm:text-base ${isPasswordMismatch
                                    ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500'
                                    : 'border-gray-200 focus:ring-brand-primary/20 focus:border-brand-primary'
                                    }`}
                                placeholder="Re-enter password"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary focus:outline-none transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {isPasswordMismatch && (
                            <p className="mt-1 text-xs text-red-600 font-medium animate-fade-in pl-1">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!isPasswordMismatch || !!isEmailInvalid || !email || !password || !confirmPassword}
                        className="w-full bg-brand-primary text-white py-3 sm:py-3.5 px-4 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transform duration-200 mt-2 text-sm sm:text-base min-h-[44px]"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-600">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-primary hover:text-brand-dark font-bold hover:underline transition-all">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
