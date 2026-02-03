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
            className={`flex flex-col h-full min-h-[400px] bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-secondary transition-all duration-300 overflow-hidden group border ${isAuthor ? 'border-brand-primary/30 ring-1 ring-brand-primary/20' : 'border-brand-secondary/20 hover:bg-brand-bg/30'}`}
        >
            {/* Thumbnail Image */}
            {blog.image_url && (
                <div className="h-36 sm:h-40 overflow-hidden">
                    <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2 sm:gap-4">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-2">
                        {blog.title}
                    </h2>
                    {isAuthor && (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-bg text-brand-primary border border-brand-secondary/30">
                            You
                        </span>
                    )}
                </div>

                <p className="text-brand-dark/70 mb-4 line-clamp-3 text-sm sm:text-base leading-relaxed">
                    {blog.content}
                </p>

                <div className="flex flex-wrap items-center text-xs text-brand-dark/50 gap-3 sm:gap-4 mt-auto pt-3 sm:pt-4 border-t border-brand-secondary/20">
                    <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium truncate">
                            {isAuthor ? 'Written by You' : (blog.profiles?.full_name || blog.profiles?.email || 'Unknown Author')}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <time dateTime={blog.created_at}>
                            {format(new Date(blog.created_at), 'MMM d, yyyy')}
                        </time>
                    </div>
                </div>
            </div>
        </Link>
    );
}
