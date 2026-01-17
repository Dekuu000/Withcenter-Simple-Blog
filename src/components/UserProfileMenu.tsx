import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { User as UserIcon, LogOut, FileText, ChevronDown } from 'lucide-react';

interface UserProfileMenuProps {
    user: User;
    onLogout: () => void;
}

export default function UserProfileMenu({ user, onLogout }: UserProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get display name or email
    // Use user_metadata if available for better name source
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const email = user.email || '';
    const avatarUrl = user.user_metadata?.avatar_url;

    // Get initial for avatar
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent focus:outline-none"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 overflow-hidden shrink-0">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xs sm:text-sm">{initial}</span>
                    )}
                </div>

                {/* Username */}
                <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-gray-900 max-w-[150px] truncate">
                    {displayName}
                </span>

                {/* Chevron */}
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl py-2 border border-gray-200 ring-1 ring-black/5 z-50 animate-fade-in-up origin-top-right">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="px-1 space-y-0.5">
                        <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors group"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                            My Profile
                        </Link>
                        <Link
                            to="/my-posts"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors group"
                            onClick={() => setIsOpen(false)}
                        >
                            <FileText className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                            My Posts
                        </Link>
                    </div>

                    <div className="my-1 border-t border-gray-100"></div>

                    {/* Logout */}
                    <div className="px-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onLogout();
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left group"
                        >
                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
