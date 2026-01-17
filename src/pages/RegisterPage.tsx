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
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isEmailInvalid
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-indigo-500'
                                }`}
                            required
                        />
                        {isEmailInvalid && (
                            <p className="mt-1 text-xs text-red-600 font-medium animate-fade-in">
                                Please enter a valid email address
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${isPasswordMismatch
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                minLength={6}
                                required
                            />
                            {/* Toggle visibility for confirm password as well, linked to same state for UX consistency or separate? 
                                Usually linked or separating them. Let's keep it linked for simplicity or separate?
                                Actually, user said "a toggle" singular. I'll use the same toggle state for both for now or duplicate the button.
                                Let's duplicate the button logic using the same state so both toggle together or use separate state?
                                Simpler: Duplicate button, use same state.
                            */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {isPasswordMismatch && (
                            <p className="mt-1 text-xs text-red-600 font-medium animate-fade-in">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!isPasswordMismatch || !!isEmailInvalid || !email || !password || !confirmPassword}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
