'use client';

import React from 'react';
import { Card } from '../ui/Card';

interface StatCardProps {
    label: string;
    value: number | string;
    helperText?: string;
    icon?: string;
    loading?: boolean;
}

export function StatCard({ label, value, helperText, icon, loading }: StatCardProps) {
    if (loading) {
        return (
            <Card className="p-6 h-32 animate-pulse bg-gray-50 flex flex-col justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
                <div className="h-3 w-32 bg-gray-100 rounded mt-2"></div>
            </Card>
        );
    }

    return (
        <Card className="p-4 transition-all hover:shadow-md min-h-[140px] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{label}</h3>
                {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
            </div>
            <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-foreground break-words leading-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
            </div>
            {helperText && (
                <p className="text-[10px] text-muted-foreground mt-auto font-normal italic line-clamp-2">
                    {helperText}
                </p>
            )}
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <StatCard key={i} label="" value="" loading />
            ))}
        </div>
    );
}
