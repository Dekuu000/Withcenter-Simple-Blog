import { MessageCircle, ThumbsUp, Share2 } from 'lucide-react';

interface PostActionsProps {
    commentCount: number;
    onCommentClick: () => void;
    className?: string;
}

export default function PostActions({
    commentCount,
    onCommentClick,
    className = '',
}: PostActionsProps) {
    return (
        <div className={`border-t border-b border-gray-200 py-1.5 sm:py-2 ${className}`}>
            <div className="flex items-center justify-around max-w-2xl mx-auto gap-1">
                {/* Like Button */}
                <button
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all flex-1 justify-center group min-h-[44px]"
                >
                    <ThumbsUp className="w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-xs sm:text-sm">Like</span>
                </button>

                {/* Comment Button */}
                <button
                    type="button"
                    onClick={onCommentClick}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all flex-1 justify-center group min-h-[44px]"
                >
                    <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-xs sm:text-sm">
                        Comment{commentCount > 0 && ` (${commentCount})`}
                    </span>
                </button>

                {/* Share Button */}
                <button
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all flex-1 justify-center group min-h-[44px]"
                >
                    <Share2 className="w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-xs sm:text-sm">Share</span>
                </button>
            </div>
        </div>
    );
}
