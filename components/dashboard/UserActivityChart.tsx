'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { GetUserActivityReq, UserActivityResponse } from '@/types';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function UserActivityChart() {
    const [stats, setStats] = useState<UserActivityResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<GetUserActivityReq>({
        type: 'month',
    });

    const loadActivity = useCallback(async (params: GetUserActivityReq) => {
        try {
            setLoading(true);
            const payload =
                params.type === 'day'
                    ? { ...params, date: params.date || new Date().toISOString().split('T')[0] }
                    : params;
            const data = await dashboardService.getUserActivity(payload);
            setStats(data);
        } catch (err) {
            console.error('Failed to load user activity:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActivity(filters);
    }, [filters, loadActivity]);

    const typeOptions = [
        { value: 'day', label: 'Kun' },
        { value: 'week', label: 'Hafta' },
        { value: 'month', label: 'Oy' },
        { value: 'year', label: 'Yil' },
    ];

    // Simple visualization since we don't have a chart library like Recharts installed
    // We'll use a CSS bar chart
    const maxVal = stats?.items.reduce((max, item) => Math.max(max, item.value), 0) || 1;

    return (
        <Card className="col-span-1 h-full shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">Faollik</CardTitle>
                <div className="flex items-center">
                    <Select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                        options={typeOptions}
                        className="h-8 py-0 mb-0 text-xs w-[100px] bg-muted/50"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-60px)]">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : stats && stats.items.length > 0 ? (
                    <div className="flex-1 flex flex-col justify-between space-y-6">
                        <div className="flex items-end justify-between h-[180px] gap-1 px-1 pt-4">
                            {stats.items.map((item, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full">
                                    <div className="flex-1 w-full flex flex-col justify-end">
                                        <div
                                            className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative"
                                            style={{ height: `${Math.max((item.value / maxVal) * 100, 2)}%` }}
                                        >
                                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                                {item.value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-6">
                                        <span className="text-[9px] text-muted-foreground block rotate-45 origin-left whitespace-nowrap">
                                            {item.date.split('-').slice(1).join('/')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center mt-auto">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Umumiy:</span>
                            <span className="text-lg font-bold text-primary">{stats.total.toLocaleString()}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm py-12">
                        Ma'lumot topilmadi
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
