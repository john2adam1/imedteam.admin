'use client';

import { useState, useEffect } from 'react';
import { User, Course, Tariff, CoursePermission } from '@/types';
import { courseService } from '@/services/course.service';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { toast } from 'sonner';

interface UserCoursesModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    allCourses: Course[];
    allTariffs: Tariff[];
}

export function UserCoursesModal({ isOpen, onClose, user, allCourses, allTariffs }: UserCoursesModalProps) {
    const [permissions, setPermissions] = useState<CoursePermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [isGranting, setIsGranting] = useState(false);

    // Grant Form State
    const [grantForm, setGrantForm] = useState({
        courseId: '',
        tariffId: '',
    });

    useEffect(() => {
        if (isOpen && user) {
            loadPermissions();
            setIsGranting(false);
            setGrantForm({ courseId: '', tariffId: '' });
        }
    }, [isOpen, user]);

    const loadPermissions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await courseService.getPermissions(1, 100, { user_id: user.id });
            setPermissions(res.data);
        } catch (error) {
            console.error('Failed to load permissions:', error);
            toast.error('Ruxsatlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleGrantAccess = async () => {
        if (!user || !grantForm.courseId || !grantForm.tariffId) {
            toast.error('Iltimos, kurs va tarifni tanlang');
            return;
        }

        const selectedTariff = allTariffs.find(t => t.id === grantForm.tariffId);
        if (!selectedTariff) {
            toast.error('Tarif topilmadi');
            return;
        }

        // Check if user already has this course
        if (permissions.some(p => p.course_id === grantForm.courseId && new Date(p.ended_at) > new Date())) {
            toast.error('Foydalanuvchi allaqachon ushbu kursga ega');
            return;
        }

        const payload = {
            user_id: user.id,
            course_id: grantForm.courseId,
            tariff_id: grantForm.tariffId
        };

        console.log('Granting permission with payload:', payload);

        try {
            await courseService.grantPermission(payload);

            toast.success('Ruxsat berildi');
            setIsGranting(false);
            setGrantForm({ courseId: '', tariffId: '' });
            loadPermissions();
        } catch (error: any) {
            console.error('Failed to grant permission:', error);
            console.error('Error response:', error.response?.data);

            const errorData = error.response?.data;
            let errorMessage = 'Ruxsat berishda xatolik';

            // Check for specific price option error
            if (errorData?.message && errorData.message.toLowerCase().includes('price option not found')) {
                errorMessage = 'Bu kurs uchun tanlangan tarif mavjud emas. Iltimos, avval kurs uchun narx belgilang.';
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.error) {
                errorMessage = errorData.error;
            }

            toast.error(`Xatolik: ${errorMessage}`);
        }
    };

    const handleRevoke = async (permissionId: string) => {
        if (!confirm('Haqiqatan ham bu ruxsatni bekor qilmoqchimisiz?')) return;
        try {
            await courseService.deletePermission(permissionId);
            toast.success('Ruxsat bekor qilindi');
            loadPermissions();
        } catch (error) {
            console.error('Failed to revoke permission:', error);
            toast.error('Ruxsatni bekor qilishda xatolik');
        }
    };

    const columns = [
        {
            key: 'course',
            header: 'Kurs',
            render: (perm: CoursePermission) => {
                const course = allCourses.find(c => c.id === perm.course_id);
                const name = course?.name;
                return typeof name === 'string' ? name : (name?.uz || name?.ru || name?.en || 'Nomsiz kurs');
            }
        },
        {
            key: 'dates',
            header: 'Muddat',
            render: (perm: CoursePermission) => (
                <div className="text-xs">
                    <div>Boshlanish: {new Date(perm.started_at).toLocaleDateString()}</div>
                    <div>Tugash: {new Date(perm.ended_at).toLocaleDateString()}</div>
                </div>
            )
        },
        {
            key: 'active',
            header: 'Holat',
            render: (perm: CoursePermission) => {
                const isActive = new Date(perm.ended_at) > new Date();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isActive ? 'Faol' : 'Tugagan'}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Amal',
            render: (perm: CoursePermission) => (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(perm.id)}
                    className="h-7 px-2 text-xs"
                >
                    O'chirish
                </Button>
            )
        }
    ];

    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${user.name} - Kurslari`}
            maxWidth="3xl"
        >
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {user.phone_number}
                    </div>
                    {!isGranting && (
                        <Button onClick={() => setIsGranting(true)} size="sm">
                            + Yangi kurs qo'shish
                        </Button>
                    )}
                </div>

                {isGranting && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 border">
                        <h3 className="font-medium text-sm">Yangi kursga ruxsat berish</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Kursni tanlang</label>
                                <select
                                    className="w-full border rounded px-2 py-1.5 text-sm"
                                    value={grantForm.courseId}
                                    onChange={(e) => setGrantForm({ ...grantForm, courseId: e.target.value, tariffId: '' })}
                                >
                                    <option value="">Tanlang...</option>
                                    {allCourses.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name?.uz || c.name?.ru || c.name?.en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Tarifni tanlang</label>
                                <select
                                    className="w-full border rounded px-2 py-1.5 text-sm"
                                    value={grantForm.tariffId}
                                    onChange={(e) => setGrantForm({ ...grantForm, tariffId: e.target.value })}
                                    disabled={!grantForm.courseId}
                                >
                                    <option value="">Tanlang...</option>
                                    {(() => {
                                        if (!grantForm.courseId) return null;

                                        const selectedCourse = allCourses.find(c => c.id === grantForm.courseId);

                                        if (!selectedCourse || !selectedCourse.price || selectedCourse.price.length === 0) {
                                            return <option value="" disabled>Bu kurs uchun narx belgilanmagan</option>;
                                        }

                                        // Filter tariffs to only those with price options for this course
                                        // CoursePriceOption.duration is in MONTHS, Tariff.duration is in DAYS
                                        // Convert months to days: 1 month = 30 days
                                        const validTariffs = allTariffs.filter(tariff => {
                                            const match = selectedCourse.price.some(priceOption => {
                                                const tariffDuration = Number(tariff.duration);
                                                const priceDurationInDays = Number(priceOption.duration) * 30; // Convert months to days
                                                return tariffDuration === priceDurationInDays;
                                            });
                                            return match;
                                        });

                                        if (validTariffs.length === 0) {
                                            return <option value="" disabled>Bu kurs uchun hech qanday tarif mavjud emas</option>;
                                        }

                                        return validTariffs.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({Math.ceil(t.duration / 30)} oy)
                                            </option>
                                        ));
                                    })()}
                                </select>
                                {grantForm.courseId && (() => {
                                    const selectedCourse = allCourses.find(c => c.id === grantForm.courseId);
                                    if (!selectedCourse || !selectedCourse.price || selectedCourse.price.length === 0) {
                                        return (
                                            <p className="text-xs text-amber-600 mt-1">
                                                ⚠️ Iltimos, avval bu kurs uchun narx belgilang
                                            </p>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setIsGranting(false)}>Bekor qilish</Button>
                            <Button
                                size="sm"
                                onClick={handleGrantAccess}
                                disabled={!grantForm.courseId || !grantForm.tariffId}
                            >
                                Saqlash
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">Yuklanmoqda...</div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        <Table
                            data={permissions}
                            columns={columns}
                        />
                        {permissions.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Hozircha kurslar yo'q
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>Yopish</Button>
                </div>
            </div>
        </Modal>
    );
}
