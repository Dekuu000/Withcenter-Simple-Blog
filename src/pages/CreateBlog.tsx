import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createBlog } from '../features/blog/blogSlice';
import { storageApi } from '../services/api';
import { Loader2 } from 'lucide-react';
import MessageModal from '../components/MessageModal';
import PremiumImageUpload from '../components/PremiumImageUpload';

export default function CreateBlog() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        try {
            // Upload image first if selected
            let image_url: string | undefined;
            if (imageFile) {
                image_url = await storageApi.uploadImage(imageFile, 'blog-images');
            }

            await dispatch(createBlog({ title, content, author_id: user.id, image_url })).unwrap();

            // Show Success Modal
            setMessageModal({
                isOpen: true,
                type: 'success',
                title: 'Published Successfully',
                message: 'Your story has been published and is now live for everyone to see.',
            });
        } catch (err: any) {
            // Show Error Modal
            setMessageModal({
                isOpen: true,
                type: 'error',
                title: 'Publishing Failed',
                message: err.message || 'Failed to publish story. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setMessageModal((prev) => ({ ...prev, isOpen: false }));
        if (messageModal.type === 'success') {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 px-3 sm:px-4 md:px-6 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Draft a New Story
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Share your ideas with the world.
                    </p>
                </div>

                <div className="bg-white shadow-xl shadow-gray-100/50 rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden max-w-5xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8"
                    >
                        {/* Title Section */}
                        <div className="space-y-2">
                            <label
                                htmlFor="title"
                                className="block text-sm font-semibold text-gray-900"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-base sm:text-lg font-medium text-gray-900 placeholder-gray-400 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 py-2.5 px-3 sm:px-4 transition-all shadow-sm"
                                placeholder="Enter title"
                                required
                                maxLength={100}
                                autoFocus
                            />
                        </div>

                        {/* Image Upload Section */}
                        <PremiumImageUpload onChange={setImageFile} disabled={isSubmitting} />

                        {/* Content Section */}
                        <div className="space-y-2 flex flex-col flex-grow">
                            <label
                                htmlFor="content"
                                className="block text-sm font-semibold text-gray-900"
                            >
                                Content
                            </label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white shadow-sm flex flex-col">
                                {/* Mock Toolbar */}
                                <div className="bg-gray-50/80 border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm select-none overflow-x-auto">
                                    <span
                                        className="hover:text-indigo-600 cursor-pointer p-1 sm:p-1.5 rounded-md hover:bg-gray-200/50 transition-colors min-w-[32px] text-center"
                                        title="Bold"
                                    >
                                        <strong>B</strong>
                                    </span>
                                    <span
                                        className="hover:text-indigo-600 cursor-pointer p-1 sm:p-1.5 rounded-md hover:bg-gray-200/50 transition-colors italic min-w-[32px] text-center"
                                        title="Italic"
                                    >
                                        <em>I</em>
                                    </span>
                                    <div className="w-px h-3 sm:h-4 bg-gray-300 mx-1 sm:mx-2"></div>
                                    <span
                                        className="hover:text-indigo-600 cursor-pointer p-1 sm:p-1.5 rounded-md hover:bg-gray-200/50 transition-colors underline whitespace-nowrap"
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
                                    className="w-full text-base sm:text-lg leading-relaxed text-gray-800 placeholder-gray-400 border-none focus:ring-0 focus:outline-none p-4 sm:p-6 resize-y bg-transparent min-h-[300px]"
                                    placeholder="Tell your story..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t border-gray-50 gap-3">
                            <span className="text-xs text-gray-400 font-medium px-2 order-2 sm:order-1">
                                Draft - Not saved
                            </span>
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all min-h-[44px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-2.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95 min-h-[44px]"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmitting ? 'Publishing...' : 'Publish'}
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
