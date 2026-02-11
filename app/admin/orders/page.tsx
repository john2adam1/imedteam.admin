'use client';

import { useEffect, useState } from 'react';
import { orderService, Order } from '@/services/order.service';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_COLORS: Record<string, string> = {
    'PAID': 'bg-green-100 text-green-800',
    'NEW': 'bg-blue-100 text-blue-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'RESERVED': 'bg-purple-100 text-purple-800',
    'EXPIRED': 'bg-gray-100 text-gray-800'
};

const ORDER_FILTER_CONFIGS: FilterConfig[] = [
    { key: 'user_id', label: 'User ID', type: 'text', placeholder: 'Search by User ID...' },
    { key: 'course_id', label: 'Course ID', type: 'text', placeholder: 'Search by Course ID...' },
    { key: 'promocode', label: 'Promocode', type: 'text', placeholder: 'Search by Promocode...' },
    {
        key: 'payment_type',
        label: 'Payment Type',
        type: 'select',
        options: [
            { value: 'click', label: 'Click' },
            { value: 'admin', label: 'Admin' },
        ],
    },
];

type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const router = useRouter();

    // New State for Tabs and Date Filters
    const [activeTab, setActiveTab] = useState('paid');
    const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
    const [customDate, setCustomDate] = useState({ from: '', to: '' });
    const [otherStatus, setOtherStatus] = useState('CANCELLED');

    const getDateRange = (type: DateRangeType) => {
        const now = new Date();
        const to = now.toISOString().split('T')[0];
        let from = '';

        switch (type) {
            case 'day':
                from = to;
                break;
            case 'week': {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(now.setDate(diff));
                from = monday.toISOString().split('T')[0];
                break;
            }
            case 'month': {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const offset = firstDay.getTimezoneOffset();
                const firstDayLocal = new Date(firstDay.getTime() - (offset * 60 * 1000));
                from = firstDayLocal.toISOString().split('T')[0];
                break;
            }
            case 'year': {
                const firstDay = new Date(now.getFullYear(), 0, 1);
                const offset = firstDay.getTimezoneOffset();
                const firstDayLocal = new Date(firstDay.getTime() - (offset * 60 * 1000));
                from = firstDayLocal.toISOString().split('T')[0];
                break;
            }
            case 'all':
                from = '2000-01-01';
                break;
            case 'custom':
                return customDate;
        }
        return { from, to };
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const { from, to } = getDateRange(dateRangeType);

            // Determine status based on active tab
            let status = '';
            if (activeTab === 'paid') status = 'PAID';
            else if (activeTab === 'new') status = 'NEW';
            else if (activeTab === 'other') status = otherStatus;

            const finalFilters = {
                ...activeFilters,
                status,
                from: activeTab === 'all' ? undefined : from, // If 'all' tab exist but we don't have one
                to: activeTab === 'all' ? undefined : to,
                type: 'range' // Enforce range type for date filtering
            };

            // If range type is 'all', we might want to extend the range or remove type='range' depending on backend
            if (dateRangeType === 'all') {
                finalFilters.from = '2000-01-01';
                finalFilters.to = '2099-12-31';
            }

            // Should apply date filters?
            if (dateRangeType === 'custom' && (!customDate.from || !customDate.to)) {
                // Wait for custom date completion
                // But functionality requires us to fetch valid data. 
                // If invalid, fallback to month? Or just don't fetch?
                // Let's fallback to today if empty
                if (!customDate.from) finalFilters.from = new Date().toISOString().split('T')[0];
                if (!customDate.to) finalFilters.to = new Date().toISOString().split('T')[0];
            }

            const res = await orderService.getAll(page, limit, finalFilters);
            const data: any = res;
            let ordersData: Order[] = [];

            if (Array.isArray(data)) {
                ordersData = data;
            } else if (data.orders) {
                ordersData = data.orders;
            } else if (data.data) {
                ordersData = data.data;
            } else if (data.items) {
                ordersData = data.items;
            } else {
                // Unknown order response structure
            }

            setOrders(ordersData);
            setTotalItems(res.count || (res as any).meta?.total_items || ordersData.length);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            // toast.error('Failed to fetch orders'); // Suppress toast on initial load or frequent updates
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [activeFilters, page, activeTab, dateRangeType, otherStatus, customDate.from, customDate.to]);


    const columns = [
        {
            key: 'user',
            header: 'User',
            render: (order: Order) => (
                <div>
                    <div className="font-medium">{order.user_name}</div>
                    <div className="text-sm text-gray-500">{order.user_phone}</div>
                </div>
            )
        },
        { key: 'course_name', header: 'Course' },
        {
            key: 'amount',
            header: 'Amount',
            render: (order: Order) => (
                <span>{new Intl.NumberFormat('uz-UZ').format(order.amount)} UZS</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (order: Order) => {
                const colorClass = STATUS_COLORS[order.status.toUpperCase()] || 'bg-gray-100 text-gray-800';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {order.status}
                    </span>
                );
            }
        },
        {
            key: 'created_at',
            header: 'Date',
            render: (order: Order) => (
                <span>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (order: Order) => (
                <Button size="sm" variant="outline" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                    View
                </Button>
            )
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            {/* Status Tabs */}
            <div className="mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="paid">Paid</TabsTrigger>
                        <TabsTrigger value="new">New (Clicked)</TabsTrigger>
                        <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Secondary Status Filter for 'Other' Tab */}
            {activeTab === 'other' && (
                <div className="mb-4 flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <select
                        value={otherStatus}
                        onChange={(e) => setOtherStatus(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                    >
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </div>
            )}

            {/* Date Range Filters */}
            <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Date Range:</span>
                <Button
                    variant={dateRangeType === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRangeType('day')}
                >
                    Day
                </Button>
                <Button
                    variant={dateRangeType === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRangeType('week')}
                >
                    Week
                </Button>
                <Button
                    variant={dateRangeType === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRangeType('month')}
                >
                    Month
                </Button>
                <Button
                    variant={dateRangeType === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRangeType('year')}
                >
                    Year
                </Button>
                <Button
                    variant={dateRangeType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRangeType('all')}
                >
                    All Time
                </Button>
                <Button
                    variant={dateRangeType === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRangeType('custom')}
                >
                    Custom
                </Button>

                {dateRangeType === 'custom' && (
                    <div className="flex gap-2 items-center ml-2">
                        <input
                            type="date"
                            value={customDate.from}
                            onChange={(e) => setCustomDate(prev => ({ ...prev, from: e.target.value }))}
                            className="px-2 py-1 border rounded text-sm"
                        />
                        <span>-</span>
                        <input
                            type="date"
                            value={customDate.to}
                            onChange={(e) => setCustomDate(prev => ({ ...prev, to: e.target.value }))}
                            className="px-2 py-1 border rounded text-sm"
                        />
                    </div>
                )}
            </div>

            <SearchFilters
                onFilter={setActiveFilters}
                configs={ORDER_FILTER_CONFIGS}
            />

            {loading ? (
                <div className="text-center py-10">Loading orders...</div>
            ) : (
                <Table
                    data={orders}
                    columns={columns}
                />
            )}

            <Pagination
                currentPage={page}
                totalItems={totalItems}
                perPage={limit}
                onPageChange={setPage}
            />

        </div>
    );
}
