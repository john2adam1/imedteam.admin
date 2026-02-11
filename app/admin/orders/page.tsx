'use client';

import { useEffect, useState } from 'react';
import { orderService, Order } from '@/services/order.service';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

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
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'NEW', label: 'New' },
            { value: 'PAID', label: 'Paid' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'RESERVED', label: 'Reserved' },
            { value: 'EXPIRED', label: 'Expired' },
        ],
    },
    {
        key: 'payment_type',
        label: 'Payment Type',
        type: 'select',
        options: [
            { value: 'click', label: 'Click' },
            { value: 'admin', label: 'Admin' },
        ],
    },
    { key: 'from', label: 'From Date', type: 'date' },
    { key: 'to', label: 'To Date', type: 'date' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const router = useRouter();


    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Backend requires a date range for status/payment filters to work correctly.
            // If no type/from/to provided, we inject an "All Time" range.
            const enhancedFilters = { ...activeFilters };
            const hasDateFilter = enhancedFilters.type || enhancedFilters.from || enhancedFilters.day;
            const hasAnyFilter = Object.keys(enhancedFilters).length > 0;

            if (hasAnyFilter && !hasDateFilter) {
                enhancedFilters.type = 'range';
                enhancedFilters.from = '2000-01-01';
                enhancedFilters.to = '2030-12-31';
            }

            const res = await orderService.getAll(page, limit, enhancedFilters);
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
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [activeFilters, page]);


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

    if (loading && orders.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            <SearchFilters
                onFilter={setActiveFilters}
                configs={ORDER_FILTER_CONFIGS}
            />

            <Table
                data={orders}
                columns={columns}
            />

            <Pagination
                currentPage={page}
                totalItems={totalItems}
                perPage={limit}
                onPageChange={setPage}
            />

        </div>
    );
}
