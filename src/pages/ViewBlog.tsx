import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogById, deleteBlog } from '../features/blog/blogSlice';
import { Loader2, Calendar, User, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from '../components/ConfirmModal';
import MessageModal from '../components/MessageModal';

export default function ViewBlog() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { currentBlog, loading, error } = useAppSelector((state) => state.blog);
    const { user } = useAppSelector((state) => state.auth);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const backLink = location.state?.from || '/';
    const backLabel = location.state?.label || 'Back to all posts';

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }
    }, [dispatch, id]);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await dispatch(deleteBlog(id)).unwrap();
            setIsDeleteModalOpen(false);
            setDeleteSuccess(true);
        } catch (err) {
            alert('Failed to delete blog');
            setIsDeleting(false);
        }
    };

    const handleSuccessClose = () => {
        setDeleteSuccess(false);
        navigate('/my-posts');
    };

    if (deleteSuccess) {
        return (
            <div className="min-h-screen bg-gray-50/30 py-12 px-4 sm:px-6 animate-fade-in">
                <MessageModal
                    isOpen={deleteSuccess}
                    onClose={handleSuccessClose}
                    title="Deleted"
                    message="Your story has been successfully deleted."
                    type="success"
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !currentBlog) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl text-gray-600">{error || 'Blog not found'}</h2>
                <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">
                    Return to Home
                </Link>
            </div>
        );
    }

    const isAuthor = user?.id === currentBlog.author_id;

    return (
        <div className="min-h-screen bg-brand-bg/30 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-brand-dark">
            <article className="max-w-3xl mx-auto">
                {/* Navigation */}
                <nav className="mb-8 flex items-center justify-between">
                    <Link
                        to={backLink}
                        className="group inline-flex items-center text-sm font-medium text-brand-dark/60 hover:text-brand-primary transition-colors"
                    >
                        <div className="mr-2 p-1.5 bg-white border border-brand-secondary/20 rounded-full group-hover:border-brand-primary/30 group-hover:bg-brand-bg transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        {backLabel}
                    </Link>

                    {isAuthor && (
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/blog/edit/${currentBlog.id}`}
                                className="p-2 text-brand-dark/40 hover:text-brand-primary hover:bg-brand-bg rounded-lg transition-all"
                                title="Edit Post"
                            >
                                <Edit2 className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleDeleteClick}
                                className="p-2 text-brand-dark/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                title="Delete Post"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </nav>

                {/* Article Header */}
                <header className="mb-10 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-brand-dark/60 mb-6 font-medium">
                        <span className="bg-brand-bg text-brand-primary px-3 py-1 rounded-full border border-brand-secondary/20">Article</span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <time>{format(new Date(currentBlog.created_at), 'MMM d, yyyy')}</time>
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {currentBlog.profiles?.full_name || currentBlog.profiles?.email || 'Unknown Author'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-dark mb-6 leading-[1.15]">
                        {currentBlog.title}
                    </h1>
                </header>

                {/* Main Content */}
                <div className="bg-white shadow-xl shadow-brand-secondary/5 ring-1 ring-brand-secondary/10 rounded-2xl p-8 md:p-12 mb-12">
                    <div className="prose prose-lg prose-indigo max-w-none text-brand-dark/80 leading-relaxed font-sans">
                        {currentBlog.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() ? (
                                <p key={index} className="mb-6 last:mb-0">
                                    {paragraph}
                                </p>
                            ) : null
                        ))}
                    </div>
                </div>

                {/* Footer / Author Section */}
                <div className="border-t border-brand-secondary/20 pt-10 mt-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 overflow-hidden ring-2 ring-white shadow-sm">
                                {currentBlog.profiles?.avatar_url ? (
                                    <img src={currentBlog.profiles.avatar_url} alt="Author" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-brand-bg flex items-center justify-center text-brand-primary font-bold text-lg border border-brand-secondary/20">
                                        {(currentBlog.profiles?.full_name || currentBlog.profiles?.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-brand-dark">
                                    Written by {currentBlog.profiles?.full_name || currentBlog.profiles?.email?.split('@')[0] || 'Unknown'}
                                </h3>
                                <p className="text-sm text-brand-dark/50">
                                    {currentBlog.profiles?.email || 'Author'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Modals */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Story"
                message="Are you sure you want to delete this story? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
                isLoading={isDeleting}
            />

            <MessageModal
                isOpen={deleteSuccess}
                onClose={handleSuccessClose}
                title="Deleted"
                message="Your story has been successfully deleted."
                type="success"
            />
        </div>
    );
}
