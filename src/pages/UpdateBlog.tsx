import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogById, updateBlog, clearCurrentBlog } from '../features/blog/blogSlice';
import { Loader2 } from 'lucide-react';

export default function UpdateBlog() {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        }
    }, [currentBlog, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await dispatch(updateBlog({ id, title, content })).unwrap();
            navigate(`/blog/${id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to update blog');
        } finally {
            setIsSubmitting(false);
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
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Story</h1>
                    <p className="text-gray-500 mt-2">Refine your masterpiece.</p>
                </div>

                {error && (
                    <div className="max-w-4xl mx-auto bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-100 flex items-center text-sm shadow-sm">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <div className="bg-white shadow-xl shadow-gray-100/50 rounded-2xl border border-gray-100 overflow-hidden max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
                        {/* Title Section */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-lg font-medium text-gray-900 placeholder-gray-400 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 py-2.5 px-4 transition-all shadow-sm"
                                placeholder="Enter title"
                                required
                                maxLength={100}
                            />
                        </div>

                        {/* Content Section */}
                        <div className="space-y-2 flex flex-col flex-grow">
                            <label htmlFor="content" className="block text-sm font-semibold text-gray-900">
                                Content
                            </label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white shadow-sm flex flex-col">
                                {/* Mock Toolbar */}
                                <div className="bg-gray-50/80 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2 text-gray-600 text-sm select-none sticky top-0 z-10 backdrop-blur-sm">
                                    <span className="hover:text-indigo-600 cursor-pointer p-1.5 rounded-md hover:bg-gray-200/50 transition-colors" title="Bold"><strong>B</strong></span>
                                    <span className="hover:text-indigo-600 cursor-pointer p-1.5 rounded-md hover:bg-gray-200/50 transition-colors italic" title="Italic"><em>I</em></span>
                                    <div className="w-px h-4 bg-gray-300 mx-2"></div>
                                    <span className="hover:text-indigo-600 cursor-pointer p-1.5 rounded-md hover:bg-gray-200/50 transition-colors underline" title="Link">Link</span>
                                </div>

                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={18}
                                    className="w-full text-lg leading-relaxed text-gray-800 placeholder-gray-400 border-none focus:ring-0 focus:outline-none p-6 resize-y bg-transparent"
                                    placeholder="Tell your story..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                            <span className="text-xs text-gray-400 font-medium px-2">
                                Last saved: Just now
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
