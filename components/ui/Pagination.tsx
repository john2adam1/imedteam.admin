'use client';

import React from 'react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalItems, perPage, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / perPage);

    if (totalItems === 0) return null; // Hide if no items, or show 0-0 of 0? Better to hide or show empty state elsewhere.

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Total page buttons to show including ellipses logic

        // Simple logic for small number of pages
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(renderPageButton(i));
            }
        } else {
            // Logic for many pages with ellipses
            if (currentPage <= 4) {
                // Show 1, 2, 3, 4, 5 ... Last
                for (let i = 1; i <= 5; i++) pages.push(renderPageButton(i));
                pages.push(<span key="ellipses1" className="px-2 text-gray-400">...</span>);
                pages.push(renderPageButton(totalPages));
            } else if (currentPage >= totalPages - 3) {
                // Show First ... n-4, n-3, n-2, n-1, n
                pages.push(renderPageButton(1));
                pages.push(<span key="ellipses1" className="px-2 text-gray-400">...</span>);
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(renderPageButton(i));
            } else {
                // Show First ... n-1, n, n+1 ... Last
                pages.push(renderPageButton(1));
                pages.push(<span key="ellipses1" className="px-2 text-gray-400">...</span>);
                pages.push(renderPageButton(currentPage - 1));
                pages.push(renderPageButton(currentPage));
                pages.push(renderPageButton(currentPage + 1));
                pages.push(<span key="ellipses2" className="px-2 text-gray-400">...</span>);
                pages.push(renderPageButton(totalPages));
            }
        }
        return pages;
    };

    const renderPageButton = (page: number) => (
        <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 p-0 rounded-full text-sm font-medium transition-colors ${page === currentPage
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 border-transparent hover:border-gray-200'
                }`}
        >
            {page}
        </Button>
    );

    const startItem = Math.min((currentPage - 1) * perPage + 1, totalItems);
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4 border-t border-gray-100 mt-4">
            <div className="text-sm text-gray-500 font-medium">
                Jam {totalItems} tadan <span className="font-semibold text-gray-900">{startItem}</span> - <span className="font-semibold text-gray-900">{endItem}</span> ko'rsatilmoqda
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-100 shadow-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 p-0 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-500"
                    aria-label="Previous page"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </Button>

                <div className="flex items-center gap-1 mx-2">
                    {renderPageNumbers()}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 p-0 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-500"
                    aria-label="Next page"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
