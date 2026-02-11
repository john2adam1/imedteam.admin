'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GetDashboardReq } from '@/types';

interface DashboardFiltersProps {
    onFilter: (params: GetDashboardReq) => void;
    initialValues?: GetDashboardReq;
}

function DashboardFiltersComponent({ onFilter, initialValues }: DashboardFiltersProps) {
    const [type, setType] = useState<GetDashboardReq['type']>(initialValues?.type || 'month');
    const [day, setDay] = useState(initialValues?.day || new Date().toISOString().split('T')[0]);
    const [from, setFrom] = useState(initialValues?.from || '');
    const [to, setTo] = useState(initialValues?.to || '');

    const typeOptions = useMemo(() => [
        { value: 'all', label: 'Barcha vaqt' },
        { value: 'day', label: 'Kun' },
        { value: 'week', label: 'Hafta' },
        { value: 'month', label: 'Oy' },
        { value: 'year', label: 'Yil' },
        { value: 'range', label: 'Oraliq' },
    ], []);

    const handleSubmit = useCallback((e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const params: GetDashboardReq = { type: type === 'all' ? 'range' : type };

        if (type === 'all') {
            params.from = '2000-01-01';
            params.to = '2030-12-31';
        } else if (type === 'day') {
            params.day = day;
        } else if (type === 'range') {
            if (!from || !to) return; // Don't filter if range is incomplete
            params.from = from;
            params.to = to;
        } else {
            // For week, month, year - always send current selected day as anchor
            params.day = day;
        }

        onFilter(params);
    }, [type, day, from, to, onFilter]);

    // Auto-apply on change if strictly possible
    useEffect(() => {
        if (type !== 'range') {
            handleSubmit();
        }
    }, [type, day, handleSubmit]);

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[150px]">
                    <Select
                        label="Davr turi"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        options={typeOptions}
                        className="mb-0"
                    />
                </div>

                {type === 'day' && (
                    <div className="min-w-[180px]">
                        <Input
                            label="Sanani tanlang"
                            type="date"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="mb-0"
                        />
                    </div>
                )}

                {type === 'range' && (
                    <>
                        <div className="min-w-[180px]">
                            <Input
                                label="Dan"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="mb-0"
                            />
                        </div>
                        <div className="min-w-[180px]">
                            <Input
                                label="Gacha"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="mb-0"
                            />
                        </div>
                    </>
                )}

                {(type === 'week' || type === 'month' || type === 'year' || type === 'all') && (
                    <p className="text-sm text-muted-foreground pb-2">
                        {type === 'all'
                            ? 'Barcha vaqtlar uchun umumiy ko\'rsatkichlar.'
                            : `${day} sanasini o'z ichiga olgan ${type === 'week' ? 'hafta' : type === 'month' ? 'oy' : 'yil'} ma'lumotlari.`
                        }
                    </p>
                )}

                <div className="ml-auto">
                    <Button type="submit" variant="default">
                        Filtrlarni qo'llash
                    </Button>
                </div>
            </div>

            {type === 'range' && from && to && from > to && (
                <p className="text-xs text-destructive mt-2">
                    'Dan' sanasi 'Gacha' sanasidan keyin bo'lishi mumkin emas.
                </p>
            )}
        </form>
    );
}

export const DashboardFilters = React.memo(DashboardFiltersComponent);
