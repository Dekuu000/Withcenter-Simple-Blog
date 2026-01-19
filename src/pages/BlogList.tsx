import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogs } from '../features/blog/blogSlice';
import BlogCard from '../features/blog/components/BlogCard';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { Loader2, PenTool } from 'lucide-react';

export default function BlogList() {
    const dispatch = useAppDispatch();
    const { blogs, loading, error, totalCount } = useAppSelector((state) => state.blog);
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const [page, setPage] = useState(1);
    const limit = 6;

    useEffect(() => {
        dispatch(fetchBlogs({ page, limit }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch, page]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="flex flex-col flex-grow animate-fade-in">
            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 text-center sm:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">Latest Posts</h1>
                    {currentUser && (
                        <Link
                            to="/create-blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-base font-semibold rounded-full hover:bg-brand-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <PenTool className="w-5 h-5" />
                            Write Story
                        </Link>
                    )}
                </div>

                <div className="min-h-[500px]">
                    {loading && blogs.length === 0 ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {blogs.map((blog) => (
                                    <BlogCard key={blog.id} blog={blog} currentUser={currentUser} />
                                ))}
                            </div>

                            {blogs.length === 0 && !loading && (
                                <div className="text-center py-20 text-brand-dark/60">
                                    No blogs found. Be the first to write one!
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={loading}
            />
        </div>
    );
}
