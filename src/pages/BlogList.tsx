import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogs } from '../features/blog/blogSlice';
import BlogCard from '../features/blog/components/BlogCard';
import Pagination from '../components/Pagination';
import { Loader2 } from 'lucide-react';

export default function BlogList() {
    const dispatch = useAppDispatch();
    const { blogs, loading, error, totalCount } = useAppSelector((state) => state.blog);
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const [page, setPage] = useState(1);
    const limit = 6;

    useEffect(() => {
        dispatch(fetchBlogs({ page, limit }));
    }, [dispatch, page]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="flex flex-col flex-grow animate-fade-in">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Latest Posts</h1>
                </div>

                {loading && blogs.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} currentUser={currentUser} />
                            ))}
                        </div>

                        {blogs.length === 0 && !loading && (
                            <div className="text-center py-20 text-gray-500">
                                No blogs found. Be the first to write one!
                            </div>
                        )}
                    </>
                )}
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
