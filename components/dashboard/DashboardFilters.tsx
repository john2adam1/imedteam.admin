'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GetDashboardReq } from '@/types';

interface DashboardFiltersProps {
    onFilter: (params: GetDashboardReq) => void;
    initialValues?: GetDashboardReq;
}

export function DashboardFilters({ onFilter, initialValues }: DashboardFiltersProps) {
    const [type, setType] = useState<GetDashboardReq['type']>(initialValues?.type || 'month');
    const [day, setDay] = useState(initialValues?.day || new Date().toISOString().split('T')[0]);
    const [from, setFrom] = useState(initialValues?.from || '');
    const [to, setTo] = useState(initialValues?.to || '');

    const typeOptions = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
        { value: 'range', label: 'Range' },
    ];

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const params: GetDashboardReq = { type };

        if (type === 'day') {
            params.day = day;
        } else if (type === 'range') {
            params.from = from;
            params.to = to;
        } else {
            // For others, we can optionally send today as reference
            params.day = new Date().toISOString().split('T')[0];
        }

        onFilter(params);
    };

    // Auto-apply on change if not range (range needs both dates usually)
    useEffect(() => {
        if (type !== 'range') {
            handleSubmit();
        }
    }, [type, day]);

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[150px]">
                    <Select
                        label="Period Type"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        options={typeOptions}
                        className="mb-0"
                    />
                </div>

                {type === 'day' && (
                    <div className="min-w-[180px]">
                        <Input
                            label="Select Date"
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
                                label="From"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="mb-0"
                            />
                        </div>
                        <div className="min-w-[180px]">
                            <Input
                                label="To"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="mb-0"
                            />
                        </div>
                    </>
                )}

                {(type === 'week' || type === 'month' || type === 'year') && (
                    <p className="text-sm text-muted-foreground pb-2">
                        Displaying data for the current {type}.
                    </p>
                )}

                <div className="ml-auto">
                    <Button type="submit" variant="primary">
                        Apply Filters
                    </Button>
                </div>
            </div>

            {type === 'range' && from && to && from > to && (
                <p className="text-xs text-destructive mt-2">
                    'From' date cannot be after 'To' date.
                </p>
            )}
        </form>
    );
}
