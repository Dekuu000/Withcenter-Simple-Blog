import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Blog } from '../../../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface BlogCardProps {
    blog: Blog;
    currentUser?: SupabaseUser | null;
    linkState?: any;
}

export default function BlogCard({ blog, currentUser, linkState }: BlogCardProps) {
    const isAuthor = currentUser && currentUser.id === blog.author_id;

    return (
        <Link
            to={`/blog/${blog.id}`}
            state={linkState}
            className={`block bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 transition-all duration-300 overflow-hidden group border ${isAuthor ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-gray-100'}`}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {blog.title}
                    </h2>
                    {isAuthor && (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            You
                        </span>
                    )}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {blog.content}
                </p>

                <div className="flex items-center text-xs text-gray-500 gap-4 mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">
                            {isAuthor ? 'Written by You' : `Author ID: ${blog.author_id.slice(0, 8)}...`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={blog.created_at}>
                            {format(new Date(blog.created_at), 'MMM d, yyyy')}
                        </time>
                    </div>
                </div>
            </div>
        </Link>
    );
}
