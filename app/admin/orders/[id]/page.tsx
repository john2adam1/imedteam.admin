'use client';

import { useEffect, useState } from 'react';
import { orderService, Order } from '@/services/order.service';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                if (typeof id === 'string') {
                    const data = await orderService.getOne(id);
                    setOrder(data);
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
                toast.error('Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent">
                <span className="mr-2">⬅️</span> Back to Orders
            </Button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.id?.slice(0, 8) || id}</h1>
                    <p className="text-gray-500 mt-1">Created on {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize 
                        ${order.status.toUpperCase() === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.status.toUpperCase() === 'NEW' ? 'bg-blue-100 text-blue-800' :
                            order.status.toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                order.status.toUpperCase() === 'RESERVED' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                    {order.status.toLowerCase()}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* User Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">👤</span>
                        <h2 className="text-lg font-semibold">Customer Information</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium">{order.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium">{order.user_phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">User ID</span>
                            <span className="font-medium text-xs text-gray-400">{order.user_id}</span>
                        </div>
                    </div>
                </div>

                {/* Course Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">📚</span>
                        <h2 className="text-lg font-semibold">Course Details</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Course</span>
                            <span className="font-medium">{order.course_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tariff</span>
                            <span className="font-medium">{order.tariff_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-medium">{order.duration} days</span>
                        </div>

                    </div>
                </div>

                {/* Payment Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm border md:col-span-2">
                    <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">💳</span>
                        <h2 className="text-lg font-semibold">Payment Statistics</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Initial Amount</span>
                                <span className="font-medium">{new Intl.NumberFormat('uz-UZ').format(order.amount + order.discount_amount)} UZS</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 text-red-500">
                                <span className="flex items-center"><span className="mr-1">🏷️</span> Discount</span>
                                <span className="font-medium">-{new Intl.NumberFormat('uz-UZ').format(order.discount_amount)} UZS</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-lg font-bold">Total Paid</span>
                                <span className="text-lg font-bold text-green-600">{new Intl.NumberFormat('uz-UZ').format(order.amount)} UZS</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Payment Type</span>
                                <span className="font-medium capitalize">{order.payment_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Promocode Used</span>
                                <span className="font-medium font-mono bg-gray-100 px-2 rounded">
                                    {order.promocode || 'None'}
                                </span>
                            </div>
                            {order.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Paid At</span>
                                    <span className="font-medium">
                                        {new Date(order.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
