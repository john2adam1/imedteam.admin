'use client';

import { useState, useEffect } from 'react';
import { Tariff } from '@/types';
import { tariffService } from '@/services/tariff.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

export default function TariffsPage() {
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const [formData, setFormData] = useState({

        name: '',
        description: '',
        duration: 30,
        order_num: 1,
    });

    useEffect(() => {
        loadTariffs();
    }, [activeFilters, page]);


    const loadTariffs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await tariffService.getAll(page, limit, activeFilters);
            setTariffs(response.data || []);
            setTotalItems(response.meta?.total_items || (response.data || []).length);

        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Tariflarni yuklashda xatolik';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTariff(null);
        setFormData({
            name: '',
            description: '',
            duration: 30,
            order_num: tariffs.length + 1,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (tariff: Tariff) => {
        setEditingTariff(tariff);
        setFormData({
            name: tariff.name,
            description: tariff.description,
            duration: tariff.duration,
            order_num: tariff.order_num,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (tariff: Tariff) => {
        if (!confirm('Ushbu tarifni o\'chirishni xohlaysizmi?')) {
            return;
        }

        try {
            await tariffService.delete(tariff.id);
            loadTariffs();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Tarifni o\'chirishda xatolik';
            alert(`Tarifni o'chirishda xatolik: ${errorMessage}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Backend expects name and description as strings
        const tariffData = {
            name: formData.name,
            description: formData.description,
            duration: formData.duration,
            order_num: formData.order_num,
        };

        try {
            if (editingTariff) {
                await tariffService.update(editingTariff.id, tariffData);
            } else {
                await tariffService.create(tariffData);
            }
            setIsModalOpen(false);
            loadTariffs();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Tarifni saqlashda xatolik';
            alert(`Xatolik: ${errorMessage}`);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Nom',
            render: (item: Tariff) => item?.name || 'Mavjud emas'
        },
        {
            key: 'duration',
            header: 'Davomiylik',
            render: (item: Tariff) => {
                if (!item?.duration) return 'Mavjud emas';
                // If duration >= 30 days, display as months
                if (item.duration >= 30) {
                    const months = Math.floor(item.duration / 30);
                    return months === 1 ? '1 oy' : `${months} oy`;
                }
                // Otherwise display as days
                return `${item.duration} kun`;
            }
        },
        {
            key: 'order_num',
            header: 'Tartib',
            render: (item: Tariff) => item?.order_num ?? 'Mavjud emas'
        },
        {
            key: 'created_at',
            header: 'Yaratilgan vaqti',
            render: (item: Tariff) => item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'Mavjud emas',
        },
    ];

    if (loading) {
        return <div className="text-center py-8">Yuklanmoqda...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Tariflarni yuklashda xatolik</p>
                    <p className="text-sm">{error}</p>
                </div>
                <button
                    onClick={loadTariffs}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Qayta urinish
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Tariflar</h1>
                <Button onClick={handleCreate}>Tarif yaratish</Button>
            </div>

            <SearchFilters
                configs={[{ key: 'name', label: 'Nom', type: 'text', placeholder: 'Nom bo\'yicha qidirish...' }]}
                onFilter={setActiveFilters}
            />

            <Table
                data={tariffs}
                columns={columns}
                onEdit={handleEdit}
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
                onClose={() => setIsModalOpen(false)}
                title={editingTariff ? 'Tarifni tahrirlash' : 'Tarif yaratish'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Tavsif"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <Input
                        label="Davomiylik (kun)"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        required
                    />
                    <Input
                        label="Tartib raqami"
                        type="number"
                        value={formData.order_num}
                        onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
                        required
                    />

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Bekor qilish
                        </Button>
                        <Button type="submit">Saqlash</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
