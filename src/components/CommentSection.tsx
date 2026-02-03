import { useEffect, useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchComments, createComment, deleteComment, clearComments } from '../features/comment/commentSlice';
import { storageApi } from '../services/api';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentSectionProps {
    blogId: string;
    hideForm?: boolean; // Hide the form, only show comments
    onlyForm?: boolean; // Only show the form, hide comments
}

export default function CommentSection({ blogId, hideForm = false, onlyForm = false }: CommentSectionProps) {
    const dispatch = useAppDispatch();
    const { comments, loading } = useAppSelector((state) => state.comment);
    const { user } = useAppSelector((state) => state.auth);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchComments(blogId));
        return () => {
            dispatch(clearComments());
        };
    }, [dispatch, blogId]);

    const handleSubmitComment = async (content: string, imageFile: File | null) => {
        if (!user) return;

        try {
            let image_url: string | undefined;
            if (imageFile) {
                try {
                    image_url = await storageApi.uploadImage(imageFile, 'comment-images');
                } catch (uploadError: any) {
                    console.error('Image upload failed:', uploadError);
                    // Show a more helpful error message
                    const errorMessage = uploadError?.message || 'Unknown error';
                    if (errorMessage.includes('Bucket not found') || errorMessage.includes('not found')) {
                        alert('Image upload failed: The storage bucket "comment-images" has not been created in Supabase. Please create it in your Supabase Storage dashboard.');
                    } else if (errorMessage.includes('security') || errorMessage.includes('policy') || errorMessage.includes('permission')) {
                        alert('Image upload failed: Storage permissions not configured. Please check your Supabase Storage bucket policies.');
                    } else {
                        alert(`Image upload failed: ${errorMessage}`);
                    }
                    return; // Don't post the comment if image upload fails
                }
            }

            await dispatch(createComment({
                content,
                image_url,
                blog_id: blogId,
                author_id: user.id,
            })).unwrap();
        } catch (error: any) {
            console.error('Failed to create comment:', error);
            alert('Failed to post comment. Please try again.');
        }
    };

    const handleDeleteComment = async (id: string) => {
        const comment = comments.find(c => c.id === id);
        setDeletingId(id);

        try {
            // Delete image from storage if exists
            if (comment?.image_url) {
                try {
                    await storageApi.deleteImage(comment.image_url, 'comment-images');
                } catch (e) {
                    console.warn('Failed to delete comment image:', e);
                }
            }

            await dispatch(deleteComment(id)).unwrap();
        } finally {
            setDeletingId(null);
        }
    };

    // If onlyForm mode, only render the form
    if (onlyForm) {
        return (
            <div>
                {user ? (
                    <CommentForm onSubmit={handleSubmitComment} user={user} />
                ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500">
                            Please <a href="/login" className="text-brand-primary font-medium hover:underline">sign in</a> to leave a comment.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mt-6">
            {/* Comment Form */}
            {!hideForm && (
                user ? (
                    <div className="mb-8">
                        <CommentForm onSubmit={handleSubmitComment} user={user} />
                    </div>
                ) : (
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500">
                            Please <a href="/login" className="text-brand-primary font-medium hover:underline">sign in</a> to leave a comment.
                        </p>
                    </div>
                )
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                </div>
            ) : comments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isAuthor={user?.id === comment.author_id}
                            onDelete={handleDeleteComment}
                            isDeleting={deletingId === comment.id}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <MessageCircle className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No comments yet</h3>
                    <p className="text-gray-500 text-sm">Be the first to comment.</p>
                </div>
            )}
        </div>
    );
}
