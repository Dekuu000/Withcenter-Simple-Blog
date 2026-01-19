import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, isLoading = false }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-12 pt-6 border-t border-brand-secondary/20 grid grid-cols-3 items-center w-full max-w-4xl mx-auto">
            <div className="flex justify-start">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-dark bg-transparent rounded-full hover:bg-brand-bg/50 hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    Previous
                </button>
            </div>

            <div className="flex justify-center">
                <span className="text-sm font-medium text-brand-dark/60 bg-brand-bg/30 px-4 py-1.5 rounded-full border border-brand-secondary/10">
                    Page <span className="text-brand-dark font-bold">{currentPage}</span> of {totalPages}
                </span>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-dark bg-transparent rounded-full hover:bg-brand-bg/50 hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    Next
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
