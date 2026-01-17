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
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center items-center gap-6">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-transparent rounded-md hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </button>

            <span className="text-sm font-medium text-gray-500">
                Page <span className="text-gray-900 font-semibold">{currentPage}</span> of {totalPages}
            </span>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-transparent rounded-md hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
