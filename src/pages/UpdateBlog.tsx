import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogById, updateBlog, clearCurrentBlog } from '../features/blog/blogSlice';
import { storageApi } from '../services/api';
import { Loader2 } from 'lucide-react';
import MessageModal from '../components/MessageModal';
import PremiumImageUpload from '../components/PremiumImageUpload';

export default function UpdateBlog() {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [messageModal, setMessageModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { currentBlog, loading } = useAppSelector((state) => state.blog);

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (currentBlog) {
            // Security check: Only author can edit
            if (user && currentBlog.author_id !== user.id) {
                navigate('/');
                return;
            }
            setTitle(currentBlog.title);
            setContent(currentBlog.content);
            setExistingImageUrl(currentBlog.image_url || null);
        }
    }, [currentBlog, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !user) return;

        setIsSubmitting(true);

        try {
            let image_url: string | null | undefined = undefined;

            // Handle image upload/removal
            if (imageFile) {
                // Upload new image
                image_url = await storageApi.uploadImage(imageFile, 'blog-images');
                // Delete old image if exists
                if (currentBlog?.image_url) {
                    try {
                        await storageApi.deleteImage(currentBlog.image_url, 'blog-images');
                    } catch (e) {
                        console.warn('Failed to delete old image:', e);
                    }
                }
            } else if (imageRemoved && currentBlog?.image_url) {
                // Image was removed without replacement
                image_url = null;
                try {
                    await storageApi.deleteImage(currentBlog.image_url, 'blog-images');
                } catch (e) {
                    console.warn('Failed to delete image:', e);
                }
            }

            await dispatch(updateBlog({ id, title, content, image_url })).unwrap();

            // Show Success Modal
            setMessageModal({
                isOpen: true,
                type: 'success',
                title: 'Update Successful',
                message: 'Your story has been successfully updated.',
            });
        } catch (err: any) {
            // Show Error Modal
            setMessageModal({
                isOpen: true,
                type: 'error',
                title: 'Update Failed',
                message: err.message || 'Failed to update blog. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
        if (file) {
            setImageRemoved(false);
        }
    };

    const handleImageRemove = () => {
        setImageFile(null);
        setExistingImageUrl(null);
        setImageRemoved(true);
    };

    const handleModalClose = () => {
        setMessageModal((prev) => ({ ...prev, isOpen: false }));
        if (messageModal.type === 'success' && id) {
            navigate(`/blog/${id}`);
        }
    };

    if (loading && !currentBlog) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg/30 py-10 px-3 sm:px-4 md:px-6 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
                        Edit Story
                    </h1>
                    <p className="text-sm sm:text-base text-brand-dark/60 mt-2">
                        Refine your masterpiece.
                    </p>
                </div>

                <div className="bg-white shadow-xl shadow-brand-secondary/5 rounded-xl sm:rounded-2xl border border-brand-secondary/20 overflow-hidden max-w-5xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8"
                    >
                        {/* Title Section */}
                        <div className="space-y-2">
                            <label
                                htmlFor="title"
                                className="block text-sm font-semibold text-brand-dark"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-base sm:text-lg font-medium text-brand-dark placeholder-gray-400 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary py-2.5 px-3 sm:px-4 transition-all shadow-sm"
                                placeholder="Enter title"
                                required
                                maxLength={100}
                            />
                        </div>

                        {/* Image Upload Section */}
                        <PremiumImageUpload
                            value={existingImageUrl}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                            disabled={isSubmitting}
                        />

                        {/* Content Section */}
                        <div className="space-y-2 flex flex-col flex-grow">
                            <label
                                htmlFor="content"
                                className="block text-sm font-semibold text-brand-dark"
                            >
                                Content
                            </label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all bg-white shadow-sm flex flex-col">
                                {/* Mock Toolbar */}
                                <div className="bg-gray-50/80 border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm select-none overflow-x-auto">
                                    <span
                                        className="hover:text-brand-primary cursor-pointer p-1 sm:p-1.5 rounded-md hover:bg-brand-bg/50 transition-colors min-w-[32px] text-center"
                                        title="Bold"
                                    >
                                        <strong>B</strong>
                                    </span>
                                    <span
                                        className="hover:text-brand-primary cursor-pointer p-1 sm:p-1.5 rounded-md hover:bg-brand-bg/50 transition-colors italic min-w-[32px] text-center"
                                        title="Italic"
                                    >
                                        <em>I</em>
                                    </span>
                                    <div className="w-px h-3 sm:h-4 bg-gray-300 mx-1 sm:mx-2"></div>
                                    <span
                                        className="hover:text-brand-primary cursor-pointer p-1 sm:p-1.5 rounded-md hover:bg-brand-bg/50 transition-colors underline whitespace-nowrap"
                                        title="Link"
                                    >
                                        Link
                                    </span>
                                </div>

                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={12}
                                    className="w-full text-base sm:text-lg leading-relaxed text-brand-dark placeholder-gray-400 border-none focus:ring-0 focus:outline-none p-4 sm:p-6 resize-y bg-transparent font-sans min-h-[300px]"
                                    placeholder="Tell your story..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t border-gray-50 gap-3">
                            <span className="text-xs text-gray-400 font-medium px-2 order-2 sm:order-1">
                                Last saved: Just now
                            </span>
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2.5 text-sm font-medium text-brand-dark/70 bg-white border border-gray-200 rounded-xl hover:bg-brand-bg/30 hover:text-brand-dark hover:border-brand-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 transition-all cursor-pointer min-h-[44px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-primary text-white px-6 sm:px-8 py-3 sm:py-2.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 disabled:shadow-none font-semibold text-sm shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 active:scale-95 cursor-pointer min-h-[44px]"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <MessageModal
                    isOpen={messageModal.isOpen}
                    onClose={handleModalClose}
                    title={messageModal.title}
                    message={messageModal.message}
                    type={messageModal.type}
                />
            </div>
        </div>
    );
}
