'use client';

import { useState, useEffect } from 'react';
import { Tariff } from '@/types';
import { tariffService } from '@/services/tariff.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';

export default function TariffsPage() {
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
    const [formData, setFormData] = useState({
        name: { uz: '', ru: '', en: '' },
        description: { uz: '', ru: '', en: '' },
        duration: 30,
        price: 0,
        order_num: 1,
        is_active: true,
    });

    useEffect(() => {
        loadTariffs();
    }, []);

    const loadTariffs = async () => {
        try {
            const response = await tariffService.getAll();
            setTariffs(response.data || []);
        } catch (error) {
            console.error('Failed to load tariffs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTariff(null);
        setFormData({
            name: { uz: '', ru: '', en: '' },
            description: { uz: '', ru: '', en: '' },
            duration: 30,
            price: 0,
            order_num: tariffs.length + 1,
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (tariff: Tariff) => {
        setEditingTariff(tariff);
        setFormData({
            name: tariff.name,
            description: tariff.description,
            duration: tariff.duration,
            price: tariff.price,
            order_num: tariff.order_num,
            is_active: tariff.is_active,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (tariff: Tariff) => {
        if (!confirm('Are you sure you want to delete this tariff?')) {
            return;
        }

        try {
            await tariffService.delete(tariff.id);
            loadTariffs();
        } catch (error) {
            console.error('Failed to delete tariff:', error);
            alert('Failed to delete tariff');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tariffData = {
            name: formData.name,
            description: formData.description,
            duration: formData.duration,
            price: formData.price,
            order_num: formData.order_num,
            is_active: formData.is_active,
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
            console.error('Failed to save tariff:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save tariff';
            alert(`Error: ${errorMessage}`);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (item: Tariff) => item.name.en || item.name.uz || item.name.ru
        },
        {
            key: 'duration',
            header: 'Duration',
            render: (item: Tariff) => `${item.duration} days`
        },
        {
            key: 'price',
            header: 'Price',
            render: (item: Tariff) => `$${item.price.toFixed(2)}`
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (item: Tariff) => (
                <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        { key: 'order_num', header: 'Order' },
        {
            key: 'created_at',
            header: 'Created At',
            render: (item: Tariff) => new Date(item.created_at).toLocaleDateString(),
        },
    ];

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Tariffs</h1>
                <Button onClick={handleCreate}>Create Tariff</Button>
            </div>

            <Table
                data={tariffs}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTariff ? 'Edit Tariff' : 'Create Tariff'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MultilangInput
                        label="Name"
                        value={formData.name}
                        onChange={(name) => setFormData({ ...formData, name })}
                        required
                    />
                    <MultilangInput
                        label="Description"
                        value={formData.description}
                        onChange={(description) => setFormData({ ...formData, description })}
                        required
                    />
                    <Input
                        label="Duration (days)"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        required
                    />
                    <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        required
                    />
                    <Input
                        label="Order Number"
                        type="number"
                        value={formData.order_num}
                        onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
                        required
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">
                            Active
                        </label>
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
