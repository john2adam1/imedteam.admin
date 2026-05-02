'use client';

import { useEffect, useState } from 'react';
import { promocodeService, PromoCode } from '@/services/promocode.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { toast } from 'sonner';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/ui/Pagination';
import { courseService } from '@/services/course.service';
import { Course } from '@/types';
import { getMultilangValue } from '@/lib/utils/multilang';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/badge';

export default function PromocodesPage() {
    const [promocodes, setPromocodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseSearch, setCourseSearch] = useState('');
    const limit = 10;
    const searchParams = useSearchParams();

    const editId = searchParams.get('edit');

    // Form states
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent' as 'percent' | 'fixed',
        discount_value: '',
        starts_at: '',
        ends_at: '',
        max_uses_total: '',
        max_uses_per_user: '',
        min_order_amount: '',
        max_discount: '',
        is_active: true,
        type: 'all' as 'all' | 'selected',
        courses: [] as string[],
    });

    const fetchPromocodes = async () => {
        try {
            setLoading(true);
            const res = await promocodeService.getAll(page, limit, activeFilters);

            // Backend response is not fully consistent across environments.
            const dynamicRes = res as any;
            const promocodesData: PromoCode[] = Array.isArray(res)
                ? res
                : res.promo_codes ||
                dynamicRes.promocodes ||
                dynamicRes.data ||
                dynamicRes.items ||
                dynamicRes.results ||
                [];

            setPromocodes(promocodesData);
            const total = res.count ||
                dynamicRes.total_items ||
                dynamicRes.meta?.total_items ||
                dynamicRes.total ||
                promocodesData.length;
            setTotalItems(total);
        } catch (error) {
            toast.error('Failed to fetch promocodes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromocodes();
    }, [activeFilters, page]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await courseService.getAllWithoutPagination();
                setCourses(res.data || []);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };
        fetchCourses();
    }, []);


    const formatToDateTimeLocal = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        if (editId && promocodes.length > 0) {
            const promo = promocodes.find(p => p.id === editId);
            if (promo) {
                handleOpenModal(promo);
            }
        }
    }, [editId, promocodes]);

    const handleOpenModal = (promo?: PromoCode) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                code: promo.code || '',
                discount_type: (promo.discount_type === 'fixed') ? 'fixed' : 'percent',
                discount_value: promo.discount_value?.toString() || '',
                starts_at: formatToDateTimeLocal(promo.starts_at),
                ends_at: formatToDateTimeLocal(promo.ends_at),
                max_uses_total: promo.max_uses_total?.toString() || '',
                max_uses_per_user: promo.max_uses_per_user?.toString() || '',
                min_order_amount: promo.min_order_amount?.toString() || '',
                max_discount: promo.max_discount?.toString() || '',
                is_active: promo.is_active ?? true,
                type: promo.type || 'all',
                courses: promo.courses || [],
            });
        } else {
            setEditingPromo(null);
            setFormData({
                code: '',
                discount_type: 'percent',
                discount_value: '',
                starts_at: '',
                ends_at: '',
                max_uses_total: '',
                max_uses_per_user: '',
                min_order_amount: '',
                max_discount: '',
                is_active: true,
                type: 'all',
                courses: [],
            });
        }
        setCourseSearch('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const toOptionalNumber = (value: string): number | undefined => {
                const trimmed = value.trim();
                if (!trimmed) return undefined;
                const parsed = Number(trimmed);
                return Number.isFinite(parsed) ? parsed : undefined;
            };

            const startsAt = formData.starts_at ? new Date(formData.starts_at).toISOString() : '';
            const endsAt = formData.ends_at ? new Date(formData.ends_at).toISOString() : '';
            const normalizedDiscountType =
                formData.discount_type === 'fixed' || formData.discount_type === 'percent'
                    ? formData.discount_type
                    : undefined;

            if (!normalizedDiscountType) {
                toast.error('Chegirma turi noto‘g‘ri. "Foiz" yoki "Aniq summa" tanlang.');
                return;
            }

            const basePayload: any = {
                discount_type: normalizedDiscountType,
                discount_value: Number(formData.discount_value) || 0,
                max_uses_total: toOptionalNumber(formData.max_uses_total),
                max_uses_per_user: toOptionalNumber(formData.max_uses_per_user),
                min_order_amount: toOptionalNumber(formData.min_order_amount),
                max_discount: toOptionalNumber(formData.max_discount),
            };

            if (startsAt) {
                basePayload.starts_at = startsAt;
            }
            if (endsAt) {
                basePayload.ends_at = endsAt;
            }

            if (formData.type === 'selected' && formData.courses.length === 0) {
                toast.error('Kamida bitta kurs tanlang');
                return;
            }



            const scopePayload =
                formData.type === 'selected'
                    ? {
                        type: 'selected' as const,
                        courses: formData.courses,
                    }
                    : {
                        type: 'all' as const,
                        courses: [] as string[],
                    };

            if (editingPromo) {
                // UPDATE — is_active faqat shu yerda yuboriladi
                const updatePayload = {
                    ...basePayload,
                    ...scopePayload,
                    is_active: formData.is_active,
                };
                await promocodeService.update(editingPromo.id, updatePayload as any);
                toast.success('Promokod muvaffaqiyatli yangilandi');
            } else {
                // CREATE — is_active yuborilmaydi (backend qabul qilmaydi)
                const createPayload = {
                    code: formData.code.trim(),
                    ...basePayload,
                    ...scopePayload,
                };
                await promocodeService.create(createPayload);
                toast.success('Promokod muvaffaqiyatli yaratildi');
            }
            handleCloseModal();
            await fetchPromocodes();

            if (editingPromo) {
                // Re-fetch the individual promocode detail directly to ensure courses/type are strictly up-to-date
                const freshPromo = await promocodeService.getOne(editingPromo.id);
                setPromocodes(prev => prev.map(p => p.id === editingPromo.id ? freshPromo : p));
            }

        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Promokodni saqlashda xatolik';
            toast.error(`Xatolik: ${message}`);
        }
    };

    const handleDelete = async (promo: PromoCode) => {
        if (!confirm('Ushbu promokodni o\'chirishni xohlaysizmi?')) return;
        try {
            await promocodeService.delete(promo.id);
            toast.success('Promokod muvaffaqiyatli o\'chirildi');
            fetchPromocodes();
        } catch (error) {
            toast.error('Promokodni o\'chirishda xatolik');
        }
    };

    const columns = [
        {
            key: 'code',
            header: 'Kod',
            render: (item: PromoCode) => (
                <Link href={`/admin/promocodes/${item.id}`} className="text-blue-600 hover:underline font-medium">
                    {item.code}
                </Link>
            )
        },
        {
            key: 'discount',
            header: 'Chegirma',
            render: (item: PromoCode) => (
                <span>{item.discount_value} {item.discount_type === 'percent' ? '%' : ' UZS'}</span>
            )
        },
        {
            key: 'usage',
            header: 'Ishlatilishi',
            render: (item: PromoCode) => (
                <span>{item.max_uses_total} jami / {item.max_uses_per_user} har bir foydalanuvchi</span>
            )
        },
        {
            key: 'type',
            header: 'Turi',
            render: (item: PromoCode) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={item.type === 'all' ? 'outline' : 'secondary'} className="w-fit">
                        {item.type === 'all' ? 'Barcha kurslar' : 'Tanlangan kurslar'}
                    </Badge>
                    {item.type === 'selected' && item.courses && (
                        <span className="text-[10px] text-muted-foreground">
                            {item.courses.length} ta kurs
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'validity',
            header: 'Amal qilish muddati',
            render: (item: PromoCode) => {
                const formatDate = (dateStr: string | null) => {
                    if (!dateStr) return '-';
                    // If it's already a full ISO string, handle it; if just YYYY-MM-DD, parse safely
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return '-';
                    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                };

                return (
                    <div className="text-sm text-gray-500">
                        {formatDate(item.starts_at)} - {formatDate(item.ends_at)}
                    </div>
                );
            }
        },
        {
            key: 'status',
            header: 'Holat',
            render: (item: PromoCode) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                >
                    {item.is_active ? 'Faol' : 'Faol emas'}
                </span>
            )
        },
    ];

    const filterConfigs: FilterConfig[] = [
        { key: 'code', label: 'Kod', type: 'text', placeholder: 'Kod bo\'yicha qidirish...' },
        { key: 'is_active', label: 'Faol', type: 'boolean' },
    ];

    if (loading && promocodes.length === 0) return <div className="p-8">Yuklanmoqda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Promokodlar</h1>
                <Button onClick={() => handleOpenModal()}>
                    <span className="mr-2">➕</span> Promokod yaratish
                </Button>
            </div>

            <SearchFilters configs={filterConfigs} onFilter={setActiveFilters} />

            <Table
                data={promocodes}
                columns={columns}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={page}
                totalItems={totalItems || promocodes.length}
                perPage={limit}
                onPageChange={setPage}
            />


            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingPromo ? 'Promokodni tahrirlash' : 'Promokod yaratish'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Kod"
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            disabled={!!editingPromo}
                            required
                        />
                        <Select
                            label="Holat"
                            value={formData.is_active ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                            options={[
                                { value: 'true', label: 'Faol' },
                                { value: 'false', label: 'Faol emas' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Amal qilish doirasi"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any, courses: e.target.value === 'all' ? [] : formData.courses })}
                            options={[
                                { value: 'all', label: 'Barcha kurslar uchun' },
                                { value: 'selected', label: 'Tanlangan kurslar uchun' },
                            ]}
                        />
                    </div>

                    {formData.type === 'selected' && (
                        <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Kurslarni tanlang ({formData.courses.length})</label>
                                <Input
                                    placeholder="Qidirish..."
                                    className="h-8 w-40 text-xs"
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                {courses
                                    .filter(c => getMultilangValue(c.name).toLowerCase().includes(courseSearch.toLowerCase()))
                                    .map(course => (
                                        <div key={course.id} className="flex items-center space-x-2 pb-1">
                                            <Checkbox
                                                id={`course-${course.id}`}
                                                checked={formData.courses.includes(course.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    if (checked) {
                                                        setFormData({ ...formData, courses: [...formData.courses, course.id] });
                                                    } else {
                                                        setFormData({ ...formData, courses: formData.courses.filter(id => id !== course.id) });
                                                    }
                                                }}
                                                label={getMultilangValue(course.name)}
                                                className="mb-0" // override mb-4 if possible, oh wait, my Checkbox component has hardcoded mb-4
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Chegirma turi"
                            value={formData.discount_type}
                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                            options={[
                                { value: 'percent', label: 'Foiz (%)' },
                                { value: 'fixed', label: 'Aniq summa (UZS)' },
                            ]}
                        />
                        <Input
                            label="Chegirma qiymati"
                            id="value"
                            type="number"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Boshlanish vaqti"
                            id="starts_at"
                            type="datetime-local"
                            value={formData.starts_at}
                            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                        />
                        <Input
                            label="Tugash vaqti"
                            id="ends_at"
                            type="datetime-local"
                            value={formData.ends_at}
                            onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Maksimal ishlatish (Jami)"
                            id="max_uses"
                            type="number"
                            value={formData.max_uses_total}
                            onChange={(e) => setFormData({ ...formData, max_uses_total: e.target.value })}
                            required
                        />
                        <Input
                            label="Maksimal ishlatish (Har bir foydalanuvchi)"
                            id="max_per_user"
                            type="number"
                            value={formData.max_uses_per_user}
                            onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Minimal buyurtma summasi"
                            id="min_order"
                            type="number"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Maksimal chegirma summasi"
                            id="max_discount"
                            type="number"
                            value={formData.max_discount}
                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Bekor qilish
                        </Button>
                        <Button type="submit">Saqlash</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
