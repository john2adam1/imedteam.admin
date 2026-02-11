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

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(i)}
                    className="w-10 h-10 p-0"
                >
                    {i}
                </Button>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                jami {totalItems} tadan {Math.min((currentPage - 1) * perPage + 1, totalItems)} - {Math.min(currentPage * perPage, totalItems)} ko'rsatilmoqda
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Oldingi
                </Button>
                <div className="flex items-center space-x-1">
                    {renderPageNumbers()}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Keyingi
                </Button>
            </div>
        </div>
    );
}
