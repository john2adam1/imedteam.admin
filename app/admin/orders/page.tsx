'use client';

import { useEffect, useState } from 'react';
import { orderService, Order } from '@/services/order.service';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderService.getAll(1, 10, activeFilters);
            console.log('=== Fetch Orders Response ===');
            console.log('Full response:', res);
            console.log('Response keys:', Object.keys(res));

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
                console.warn('Unknown order response structure. Keys:', Object.keys(data));
                console.warn('Full response:', data);
            }

            console.log('Setting orders:', ordersData);
            console.log('First order sample:', ordersData[0]);
            setOrders(ordersData);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [activeFilters]);

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
            render: (order: Order) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                </span>
            )
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

    const filterConfigs: FilterConfig[] = [
        { key: 'user_id', label: 'User ID', type: 'text', placeholder: 'Search by User ID...' },
        { key: 'course_id', label: 'Course ID', type: 'text', placeholder: 'Search by Course ID...' },
        { key: 'promocode', label: 'Promocode', type: 'text', placeholder: 'Search by Promocode...' },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'cancelled', label: 'Cancelled' },
            ],
        },
    ];

    if (loading && orders.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            <SearchFilters configs={filterConfigs} onFilter={setActiveFilters} />

            <Table
                data={orders}
                columns={columns}
            />
        </div>
    );
}
