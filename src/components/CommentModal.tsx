import { X } from 'lucide-react';
import { Blog } from '../types';
import CommentSection from './CommentSection';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    blog: Blog;
}

export default function CommentModal({ isOpen, onClose, blog }: CommentModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-2 sm:p-4"
            onClick={onClose}
        >
            {/* Modal Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] md:h-[85vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col"
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate pr-2">
                        {blog.profiles?.full_name || blog.profiles?.email?.split('@')[0] || 'User'}
                        's Post
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all shrink-0"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Post Preview */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{blog.content}</p>

                        {blog.image_url && (
                            <div className="mt-3 sm:mt-4">
                                <img
                                    src={blog.image_url}
                                    alt={blog.title}
                                    className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Comments Section - No form here, just the list */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <CommentSection blogId={blog.id} hideForm={true} />
                    </div>
                </div>

                {/* Sticky Comment Form at Bottom */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
                    <CommentSection blogId={blog.id} onlyForm={true} />
                </div>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>,
        document.body
    );
}
