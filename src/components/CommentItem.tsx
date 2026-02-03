import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Comment } from '../types';

interface CommentItemProps {
    comment: Comment;
    isAuthor: boolean;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

export default function CommentItem({ comment, isAuthor, onDelete, isDeleting = false }: CommentItemProps) {
    const [showFullImage, setShowFullImage] = useState(false);

    return (
        <div className="flex gap-3 py-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-secondary/20 overflow-hidden">
                    {comment.profiles?.avatar_url ? (
                        <img
                            src={comment.profiles.avatar_url}
                            alt={comment.profiles.full_name || 'User'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        (comment.profiles?.full_name || comment.profiles?.email || '?').charAt(0).toUpperCase()
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-brand-dark">
                                {comment.profiles?.full_name || comment.profiles?.email?.split('@')[0] || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {format(new Date(comment.created_at), 'MMM d, yyyy · h:mm a')}
                            </span>
                        </div>

                        {isAuthor && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                title="Delete comment"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Text Content */}
                    <p className="text-sm text-brand-dark/80 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>
                </div>

                {/* Attached Image */}
                {comment.image_url && (
                    <div className="mt-2">
                        <img
                            src={comment.image_url}
                            alt="Comment attachment"
                            onClick={() => setShowFullImage(true)}
                            className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                    </div>
                )}
            </div>

            {/* Fullscreen Image Modal */}
            {showFullImage && comment.image_url && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowFullImage(false)}
                >
                    <img
                        src={comment.image_url}
                        alt="Comment attachment"
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}
