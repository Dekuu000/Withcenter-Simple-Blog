import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogsByAuthor } from '../features/blog/blogSlice';
import BlogCard from '../features/blog/components/BlogCard';
import { Loader2, PenTool } from 'lucide-react';
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
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => user && dispatch(fetchBlogsByAuthor(user.id))}
                    className="mt-4 text-indigo-600 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    const postCount = blogs.length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <header className="mb-10 flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Posts</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        You have published <span className="font-medium text-indigo-600">{postCount}</span> {postCount === 1 ? 'story' : 'stories'} so far.
                    </p>
                </div>

                {
                    blogs.length > 0 && (
                        <Link
                            to="/create-blog"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <PenTool className="w-4 h-4" />
                            Write New
                        </Link>
                    )
                }
            </header >

            {
                blogs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <PenTool className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            You haven't written any posts yet. Share your thoughts with the world and start your first story today.
                        </p>
                        <Link
                            to="/create-blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
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
                )
            }
        </div >
    );
}
