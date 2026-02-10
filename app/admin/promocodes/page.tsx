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

export default function PromocodesPage() {
    const [promocodes, setPromocodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const searchParams = useSearchParams();

    const editId = searchParams.get('edit');

    // Form states
    const [formData, setFormData] = useState({
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
    });

    const fetchPromocodes = async () => {
        try {
            setLoading(true);
            const res = await promocodeService.getAll(page, limit, activeFilters);
            console.log('=== Fetch Promocodes Response ===');
            console.log('Full response:', res);
            console.log('All keys:', Object.keys(res));

            // Try different response structures
            let promocodesData: PromoCode[] = [];

            if (Array.isArray(res)) {
                promocodesData = res;
            } else if (res.promo_codes) {
                promocodesData = res.promo_codes;
            } else if ((res as any).data) {
                promocodesData = (res as any).data;
            } else if ((res as any).items) {
                promocodesData = (res as any).items;
            } else if ((res as any).results) {
                promocodesData = (res as any).results;
            } else if ((res as any).promocodes) {
                promocodesData = (res as any).promocodes;
            } else {
                console.warn('Unknown response structure. Keys:', Object.keys(res));
                console.warn('Full object:', res);
            }

            console.log('Setting promocodes:', promocodesData);
            console.log('First promocode sample:', promocodesData[0]);
            setPromocodes(promocodesData);
            setTotalItems(res.count || (res as any).meta?.total_items || promocodesData.length);
        } catch (error) {
            console.error('Failed to fetch promocodes:', error);
            toast.error('Failed to fetch promocodes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromocodes();
    }, [activeFilters, page]);


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
                discount_type: promo.discount_type || 'percent',
                discount_value: promo.discount_value?.toString() || '',
                // Convert YYYY-MM-DD to datetime-local format (YYYY-MM-DDTHH:MM)
                starts_at: promo.starts_at ? `${promo.starts_at}T00:00` : '',
                ends_at: promo.ends_at ? `${promo.ends_at}T23:59` : '',
                max_uses_total: promo.max_uses_total?.toString() || '',
                max_uses_per_user: promo.max_uses_per_user?.toString() || '',
                min_order_amount: promo.min_order_amount?.toString() || '',
                max_discount: promo.max_discount?.toString() || '',
                is_active: promo.is_active ?? true,
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
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                code: formData.code,
                discount_type: formData.discount_type,
                discount_value: Number(formData.discount_value) || 0,
                is_active: formData.is_active,
                starts_at: formData.starts_at.split('T')[0], // YYYY-MM-DD format
                ends_at: formData.ends_at.split('T')[0], // YYYY-MM-DD format
                max_uses_total: Number(formData.max_uses_total) || 0,
                max_uses_per_user: Number(formData.max_uses_per_user) || 0,
                min_order_amount: Number(formData.min_order_amount) || 0,
                max_discount: Number(formData.max_discount) || 0,
            };

            console.log('=== Promocode Submission ===');
            console.log('Form Data:', formData);
            console.log('Payload to send:', payload);

            if (editingPromo) {
                // Update
                const { code, ...updatePayload } = payload;
                console.log('Updating promocode:', editingPromo.id, updatePayload);
                const result = await promocodeService.update(editingPromo.id, updatePayload as any);
                console.log('Update result:', result);
                toast.success('Promocode updated successfully');
            } else {
                // Create
                console.log('Creating new promocode');
                const result = await promocodeService.create(payload);
                console.log('Create result:', result);
                toast.success('Promocode created successfully');
            }
            handleCloseModal();
            fetchPromocodes();
        } catch (error: any) {
            console.error('=== Promocode Error ===');
            console.error('Error object:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            console.error('Error message:', error.message);
            const message = error.response?.data?.message || error.message || 'Failed to save promocode';
            toast.error(`Error: ${message}`);
        }
    };

    const handleDelete = async (promo: PromoCode) => {
        if (!confirm('Are you sure you want to delete this promocode?')) return;
        try {
            await promocodeService.delete(promo.id);
            toast.success('Promocode deleted successfully');
            fetchPromocodes();
        } catch (error) {
            console.error('Failed to delete promocode:', error);
            toast.error('Failed to delete promocode');
        }
    };

    const columns = [
        {
            key: 'code',
            header: 'Code',
            render: (item: PromoCode) => (
                <Link href={`/admin/promocodes/${item.id}`} className="text-blue-600 hover:underline font-medium">
                    {item.code}
                </Link>
            )
        },
        {
            key: 'discount',
            header: 'Discount',
            render: (item: PromoCode) => (
                <span>{item.discount_value} {item.discount_type === 'percent' ? '%' : ' UZS'}</span>
            )
        },
        {
            key: 'usage',
            header: 'Usage',
            render: (item: PromoCode) => (
                <span>{item.max_uses_total} total / {item.max_uses_per_user} per user</span>
            )
        },
        {
            key: 'validity',
            header: 'Validity',
            render: (item: PromoCode) => {
                // Parse YYYY-MM-DD format properly
                const startDate = item.starts_at ? new Date(item.starts_at + 'T00:00:00') : null;
                const endDate = item.ends_at ? new Date(item.ends_at + 'T23:59:59') : null;

                return (
                    <div className="text-sm text-gray-500">
                        {startDate ? startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} -{' '}
                        {endDate ? endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                );
            }
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: PromoCode) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                >
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
    ];

    const filterConfigs: FilterConfig[] = [
        { key: 'code', label: 'Code', type: 'text', placeholder: 'Search by code...' },
        { key: 'is_active', label: 'Active', type: 'boolean' },
    ];

    if (loading && promocodes.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Promocodes</h1>
                <Button onClick={() => handleOpenModal()}>
                    <span className="mr-2">➕</span> Create Promocode
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
                totalItems={totalItems}
                perPage={limit}
                onPageChange={setPage}
            />


            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingPromo ? 'Edit Promocode' : 'Create Promocode'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Code"
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            disabled={!!editingPromo}
                            required
                        />
                        <Select
                            label="Status"
                            value={formData.is_active ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                            options={[
                                { value: 'true', label: 'Active' },
                                { value: 'false', label: 'Inactive' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Discount Type"
                            value={formData.discount_type}
                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                            options={[
                                { value: 'percent', label: 'Percentage' },
                                { value: 'fixed', label: 'Fixed Amount' },
                            ]}
                        />
                        <Input
                            label="Discount Value"
                            id="value"
                            type="number"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Starts At"
                            id="starts_at"
                            type="datetime-local"
                            value={formData.starts_at}
                            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                            required
                        />
                        <Input
                            label="Ends At"
                            id="ends_at"
                            type="datetime-local"
                            value={formData.ends_at}
                            onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Max Uses (Total)"
                            id="max_uses"
                            type="number"
                            value={formData.max_uses_total}
                            onChange={(e) => setFormData({ ...formData, max_uses_total: e.target.value })}
                            required
                        />
                        <Input
                            label="Max Uses (Per User)"
                            id="max_per_user"
                            type="number"
                            value={formData.max_uses_per_user}
                            onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Min Order Amount"
                            id="min_order"
                            type="number"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Max Discount Amount"
                            id="max_discount"
                            type="number"
                            value={formData.max_discount}
                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
