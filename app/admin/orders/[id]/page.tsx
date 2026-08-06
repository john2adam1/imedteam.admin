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
                toast.error('Buyurtma ma\'lumotlarini yuklashda xatolik');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const getStatusText = (status: string) => {
        switch (status.toUpperCase()) {
            case 'NEW': return 'Yangi';
            case 'PAID': return 'To\'langan';
            case 'CANCELLED': return 'Bekor qilingan';
            case 'RESERVED': return 'Band qilingan';
            default: return status;
        }
    };

    if (loading) return <div className="p-8">Yuklanmoqda...</div>;
    if (!order) return <div className="p-8">Buyurtma topilmadi</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent">
                <span className="mr-2">⬅️</span> Buyurtmalarga qaytish
            </Button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Buyurtma #{order.id?.slice(0, 8) || id}</h1>
                    <p className="text-gray-500 mt-1">Yaratilgan vaqti: {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize 
                        ${order.status.toUpperCase() === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.status.toUpperCase() === 'NEW' ? 'bg-blue-100 text-blue-800' :
                            order.status.toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                order.status.toUpperCase() === 'RESERVED' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                    {getStatusText(order.status)}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* User Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">👤</span>
                        <h2 className="text-lg font-semibold">Mijoz ma'lumotlari</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ism</span>
                            <span className="font-medium">{order.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Telefon</span>
                            <span className="font-medium">{order.user_phone}</span>
                        </div>
                    </div>
                </div>

                {/* Course Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">📚</span>
                        <h2 className="text-lg font-semibold">Kurs ma'lumotlari</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Kurs</span>
                            <span className="font-medium">{order.course_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tarif</span>
                            <span className="font-medium">{order.tariff_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Davomiyligi</span>
                            <span className="font-medium">{order.duration} oy</span>
                        </div>

                    </div>
                </div>

                {/* Payment Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm border md:col-span-2">
                    <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">💳</span>
                        <h2 className="text-lg font-semibold">To'lov statistikasi</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Boshlang'ich summa</span>
                                <span className="font-medium">{new Intl.NumberFormat('uz-UZ').format(order.amount + order.discount_amount)} UZS</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 text-red-500">
                                <span className="flex items-center"><span className="mr-1">🏷️</span> Chegirma</span>
                                <span className="font-medium">-{new Intl.NumberFormat('uz-UZ').format(order.discount_amount)} UZS</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-lg font-bold">Jami to'langan</span>
                                <span className="text-lg font-bold text-green-600">{new Intl.NumberFormat('uz-UZ').format(order.amount)} UZS</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">To'lov turi</span>
                                <span className="font-medium capitalize">{order.payment_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ishlatilgan promokod</span>
                                <span className="font-medium font-mono bg-gray-100 px-2 rounded">
                                    {order.promocode || 'Yo\'q'}
                                </span>
                            </div>
                            {order.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">To'langan vaqti</span>
                                    <span className="font-medium">
                                        {new Date(order.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admin Info (check_url, comment) */}
                {(order.check_url || order.comment || order.is_free) && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border md:col-span-2">
                        <div className="flex items-center mb-4">
                            <span className="text-xl mr-2">🛡️</span>
                            <h2 className="text-lg font-semibold">Admin ma'lumotlari</h2>
                        </div>
                        <div className="space-y-3">
                            {order.is_free && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">To'lov holati</span>
                                    <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                                        🎁 Bepul
                                    </span>
                                </div>
                            )}
                            {order.check_url && (
                                <div className="space-y-2">
                                    <span className="text-gray-500 block">Chek rasmi</span>
                                    <a
                                        href={order.check_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <img
                                            src={order.check_url}
                                            alt="Chek rasmi"
                                            className="w-full max-h-80 object-contain rounded-lg border bg-gray-50 hover:opacity-90 transition-opacity cursor-pointer"
                                        />
                                        <span className="text-xs text-blue-500 hover:underline mt-1 block text-center">
                                            Kattalashtirish uchun bosing
                                        </span>
                                    </a>
                                </div>
                            )}
                            {order.comment && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Izoh</span>
                                    <span className="font-medium text-right max-w-xs">{order.comment}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
