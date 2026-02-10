'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { promocodeService, PromoCode } from '@/services/promocode.service';
import { PromocodeRedemption } from '@/types';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { toast } from 'sonner';

export default function PromocodeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [promocode, setPromocode] = useState<PromoCode | null>(null);
    const [redemptions, setRedemptions] = useState<PromocodeRedemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [redemptionsLoading, setRedemptionsLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchRedemptions();
        }
    }, [id, activeFilters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await promocodeService.getOne(id);
            if (!data) {
                router.push('/admin/promocodes');
                return;
            }
            setPromocode(data);
        } catch (error) {
            console.error('Failed to load promocode:', error);
            toast.error('Failed to load promocode');
        } finally {
            setLoading(false);
        }
    };

    const fetchRedemptions = async () => {
        try {
            setRedemptionsLoading(true);
            const res = await promocodeService.getRedemptions(id, 1, 50, activeFilters);
            setRedemptions(res.redemptions || []);
        } catch (error) {
            console.error('Failed to load redemptions:', error);
            // Don't toast here to avoid cluttering if it's just a 404/empty
        } finally {
            setRedemptionsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!promocode) {
        return null;
    }

    const breadcrumbItems = [
        { label: 'Promocodes', href: '/admin/promocodes' },
        { label: promocode.code },
    ];

    const columns = [
        { key: 'user_name', header: 'User' },
        { key: 'user_phone', header: 'Contact' },
        {
            key: 'course_name',
            header: 'Course',
            render: (item: PromocodeRedemption) => item.course_name || 'N/A'
        },
        {
            key: 'used_at',
            header: 'Used At',
            render: (item: PromocodeRedemption) => new Date(item.used_at).toLocaleString()
        },
        {
            key: 'discount_amount',
            header: 'Saved',
            render: (item: PromocodeRedemption) => `${item.discount_amount.toLocaleString()} UZS`
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: PromocodeRedemption) => (
                <Badge variant={item.status === 'paid' ? 'success' : 'secondary'}>
                    {item.status || 'N/A'}
                </Badge>
            )
        }
    ];

    const filterConfigs: FilterConfig[] = [
        { key: 'user_name', label: 'User Name', type: 'text', placeholder: 'Search by user...' },
        { key: 'course_name', label: 'Course Name', type: 'text', placeholder: 'Search by course...' },
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promocode: {promocode.code}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <Badge variant={promocode.is_active ? 'success' : 'secondary'}>
                            {promocode.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {promocode.discount_value} {promocode.discount_type === 'percent' ? '%' : 'UZS'} discount
                        </span>
                    </div>
                </div>
                <Button onClick={() => router.push(`/admin/promocodes?edit=${id}`)}>
                    Edit Promocode
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{redemptions.length} / {promocode.max_uses_total || '∞'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Max {promocode.max_uses_per_user} per user
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Validity Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <span className="font-semibold">From:</span> {new Date(promocode.starts_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold">Until:</span> {new Date(promocode.ends_at).toLocaleDateString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Order Limits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <span className="font-semibold">Min order:</span> {promocode.min_order_amount.toLocaleString()} UZS
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold">Max discount:</span> {promocode.max_discount.toLocaleString()} UZS
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Redemptions</CardTitle>
                            <CardDescription>
                                Users who have used this promocode
                            </CardDescription>
                        </div>
                    </div>
                    <div className="mt-4">
                        <SearchFilters configs={filterConfigs} onFilter={setActiveFilters} />
                    </div>
                </CardHeader>
                <CardContent>
                    {redemptionsLoading && redemptions.length === 0 ? (
                        <div className="flex justify-center py-8 text-muted-foreground">Loading redemptions...</div>
                    ) : redemptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No redemptions found.</div>
                    ) : (
                        <Table data={redemptions} columns={columns} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
