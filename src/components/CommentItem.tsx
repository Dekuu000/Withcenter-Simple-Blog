import { useState } from 'react';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Comment } from '../types';

interface CommentItemProps {
    comment: Comment;
    isAuthor: boolean;
    onDelete: (id: string) => void;
    onUpdate?: (id: string, content: string) => Promise<void>;
    isDeleting?: boolean;
}

export default function CommentItem({
    comment,
    isAuthor,
    onDelete,
    onUpdate,
    isDeleting = false,
}: CommentItemProps) {
    const [showFullImage, setShowFullImage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        if (!editContent.trim() || !onUpdate) return;

        setIsUpdating(true);
        try {
            await onUpdate(comment.id, editContent);
            setIsEditing(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

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
                        (comment.profiles?.full_name || comment.profiles?.email || '?')
                            .charAt(0)
                            .toUpperCase()
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
                                {comment.profiles?.full_name ||
                                    comment.profiles?.email?.split('@')[0] ||
                                    'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {format(new Date(comment.created_at), 'MMM d, yyyy · h:mm a')}
                            </span>
                        </div>

                        {isAuthor && !isEditing && (
                            <div className="flex items-center gap-1">
                                {onUpdate && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-bg/50 rounded-lg transition-all cursor-pointer"
                                        title="Edit comment"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    disabled={isDeleting}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Text Content */}
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[80px]"
                                autoFocus
                            />
                            <div className="flex items-center gap-2 justify-end">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isUpdating || !editContent.trim()}
                                    className="p-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <span className="animate-spin">⌛</span>
                                    ) : (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-brand-dark/80 whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    )}
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
