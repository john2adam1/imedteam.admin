'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { RatingItem, RatingResponse } from '@/types';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default function RatingPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RatingResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year' | 'total'>('total');

    const fetchRating = useCallback(async (type: 'day' | 'week' | 'month' | 'year' | 'total') => {
        setLoading(true);
        try {
            const res = await userService.getRating(type, 100);
            setData(res);
        } catch (error) {
            console.error(error);
            toast.error("Reytingni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRating(activeTab);
    }, [activeTab, fetchRating]);

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-full">
            <Breadcrumb
                items={[
                    { label: 'Foydalanuvchilar', href: '/admin/users' },
                    { label: 'Reyting' }
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Foydalanuvchilar Reytingi</h1>
                    <p className="text-slate-500">Platformadagi eng faol foydalanuvchilar ro'yxati</p>
                </div>

                <Tabs defaultValue="total" value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full md:w-auto">
                    <TabsList className="grid grid-cols-5 w-full md:w-[400px]">
                        <TabsTrigger value="day">Bugun</TabsTrigger>
                        <TabsTrigger value="week">Hafta</TabsTrigger>
                        <TabsTrigger value="month">Oy</TabsTrigger>
                        <TabsTrigger value="year">Yil</TabsTrigger>
                        <TabsTrigger value="total">Jami</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid gap-6">
                {data?.me && (
                    <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2">
                            <Badge variant="success">Sizning natijangiz</Badge>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                                        {data.me.rank}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-900">{data.me.name}</div>
                                        <div className="text-sm text-slate-500 font-mono">ID: {data.me.user_id}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Ballar</div>
                                        <div className="text-2xl font-black text-primary">{data.me.activity.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-xl shadow-slate-200/50 border-none">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-xl">Top 100 Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-80 gap-3">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-slate-400 animate-pulse">Reyting ma'lumotlari yuklanmoqda...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b bg-slate-50/50">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">O'rin</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Foydalanuvchi</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider px-6 text-right">Ball</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.items.map((item) => {
                                            const isTop3 = item.rank <= 3;
                                            const rankStyles = {
                                                1: 'bg-yellow-400 text-white shadow-yellow-200',
                                                2: 'bg-slate-300 text-slate-800 shadow-slate-100',
                                                3: 'bg-orange-400 text-white shadow-orange-200',
                                            }[item.rank] || 'bg-slate-100 text-slate-600';

                                            return (
                                                <tr
                                                    key={item.user_id}
                                                    className={`border-b transition-colors hover:bg-slate-50/80 ${item.is_me ? 'bg-primary/[0.03]' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${rankStyles}`}>
                                                            {item.rank}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                {item.image_url ? (
                                                                    <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-bold border ring-2 ring-white shadow-sm">
                                                                        {item.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                {item.is_me && (
                                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                                    {item.name}
                                                                    {item.is_me && <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/30 text-primary">SIZ</Badge>}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-mono tracking-tighter">@{item.user_id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className={`font-black text-lg ${isTop3 ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {item.activity.toLocaleString()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(!data || data.items.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="text-4xl">📭</div>
                                                        <div className="text-slate-500 font-medium">Hozircha reyting ma'lumotlari mavjud emas</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
