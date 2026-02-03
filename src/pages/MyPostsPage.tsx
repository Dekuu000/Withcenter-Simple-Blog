import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogsByAuthor } from '../features/blog/blogSlice';
import BlogCard from '../features/blog/components/BlogCard';
import { Loader2, PenTool, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyPostsPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { blogs, loading, error } = useAppSelector((state) => state.blog);

    useEffect(() => {
        if (user) {
            dispatch(fetchBlogsByAuthor(user.id));
        }
    }, [dispatch, user]);

    // Handle initial loading
    if (loading && blogs.length === 0) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => user && dispatch(fetchBlogsByAuthor(user.id))}
                    className="mt-4 text-brand-primary hover:underline hover:text-brand-dark"
                >
                    Try again
                </button>
            </div>
        );
    }

    const postCount = blogs.length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            {/* Back Link */}
            <nav className="mb-6">
                <Link
                    to="/"
                    className="group inline-flex items-center text-sm font-medium text-brand-dark/60 hover:text-brand-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Back to all posts</span>
                </Link>
            </nav>

            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-secondary/20 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark tracking-tight">
                        Your Posts
                    </h1>
                    <p className="text-brand-dark/60 mt-2 text-sm">
                        You have published{' '}
                        <span className="font-medium text-brand-primary">{postCount}</span>{' '}
                        {postCount === 1 ? 'story' : 'stories'} so far.
                    </p>
                </div>

                {blogs.length > 0 && (
                    <Link
                        to="/create-blog"
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-brand-primary text-white text-sm sm:text-base font-semibold rounded-full hover:bg-brand-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[44px]"
                    >
                        <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Write Story</span>
                    </Link>
                )}
            </header>

            {blogs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-brand-secondary/30 shadow-sm">
                    <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                        <PenTool className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-semibold text-brand-dark mb-2">No posts yet</h2>
                    <p className="text-brand-dark/60 max-w-sm mx-auto mb-8">
                        You haven't written any posts yet. Share your thoughts with the world and
                        start your first story today.
                    </p>
                    <Link
                        to="/create-blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        Draft your first story
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <BlogCard
                            key={blog.id}
                            blog={blog}
                            currentUser={user}
                            linkState={{ from: '/my-posts', label: 'Back to my posts' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
