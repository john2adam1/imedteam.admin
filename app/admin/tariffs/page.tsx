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
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        order_num: 1,
    });

    useEffect(() => {
        loadTariffs();
    }, []);

    const loadTariffs = async () => {
        try {
            setError(null);
            const response = await tariffService.getAll();
            setTariffs(response.data || []);
        } catch (error: any) {
            console.error('Failed to load tariffs:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load tariffs';
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
        if (!confirm('Are you sure you want to delete this tariff?')) {
            return;
        }

        try {
            console.log('Attempting to delete tariff with ID:', tariff.id);
            await tariffService.delete(tariff.id);
            console.log('Delete successful');
            loadTariffs();
        } catch (error: any) {
            console.error('Failed to delete tariff:', error);
            console.error('Error response:', error?.response);
            console.error('Error status:', error?.response?.status);
            console.error('Error data:', error?.response?.data);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete tariff';
            alert(`Failed to delete tariff: ${errorMessage}`);
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

        console.log('Submitting tariff data:', tariffData);
        console.log('Editing tariff:', editingTariff);

        try {
            if (editingTariff) {
                console.log('Updating tariff with ID:', editingTariff.id);
                await tariffService.update(editingTariff.id, tariffData);
            } else {
                console.log('Creating new tariff');
                await tariffService.create(tariffData);
            }
            setIsModalOpen(false);
            loadTariffs();
        } catch (error: any) {
            console.error('Failed to save tariff:', error);
            console.error('Error response:', error?.response);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save tariff';
            alert(`Error: ${errorMessage}`);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (item: Tariff) => item?.name || 'N/A'
        },
        {
            key: 'duration',
            header: 'Duration',
            render: (item: Tariff) => {
                if (!item?.duration) return 'N/A';
                // If duration >= 30 days, display as months
                if (item.duration >= 30) {
                    const months = Math.floor(item.duration / 30);
                    return months === 1 ? '1 month' : `${months} months`;
                }
                // Otherwise display as days
                return `${item.duration} days`;
            }
        },
        {
            key: 'order_num',
            header: 'Order',
            render: (item: Tariff) => item?.order_num ?? 'N/A'
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (item: Tariff) => item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
        },
    ];

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error loading tariffs</p>
                    <p className="text-sm">{error}</p>
                </div>
                <button
                    onClick={loadTariffs}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
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
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                        label="Order Number"
                        type="number"
                        value={formData.order_num}
                        onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
                        required
                    />

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
