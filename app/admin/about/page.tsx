'use client';

import { useState, useEffect } from 'react';
import { About } from '@/types';
import { aboutService } from '@/services/about.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';

export default function AboutPage() {
    const [items, setItems] = useState<About[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<About | null>(null);
    const [formData, setFormData] = useState({
        title: { uz: '', ru: '', en: '' },
        description: { uz: '', ru: '', en: '' },
        order_num: 1,
        link_url: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await aboutService.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Failed to load about items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem(null);
        setFormData({
            title: { uz: '', ru: '', en: '' },
            description: { uz: '', ru: '', en: '' },
            order_num: items.length + 1,
            link_url: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: About) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            order_num: item.order_num,
            link_url: item.link_url || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: About) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            await aboutService.delete(item.id);
            loadData();
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingItem) {
                await aboutService.update(editingItem.id, formData);
            } else {
                await aboutService.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to save item:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save item';
            alert(`Error: ${errorMessage}`);
        }
    };

    const columns = [
        {
            key: 'title',
            header: 'Title',
            render: (item: About) => item.title.en || item.title.uz || item.title.ru
        },
        {
            key: 'order_num',
            header: 'Order',
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: About) => (
                <div className="flex gap-2">
                    <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                        Edit
                    </Button>
                    <Button onClick={() => handleDelete(item)} variant="destructive" size="sm">
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">About Section</h1>
                <Button onClick={handleCreate}>Add Item</Button>
            </div>

            <Table data={items} columns={columns} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Item' : 'Add Item'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MultilangInput
                        label="Title"
                        value={formData.title}
                        onChange={(title) => setFormData({ ...formData, title })}
                        required
                    />
                    <MultilangInput
                        label="Description"
                        value={formData.description}
                        onChange={(description) => setFormData({ ...formData, description })}
                        required
                    />
                    <Input
                        label="Link URL"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    />
                    <Input
                        label="Order Number"
                        type="number"
                        value={formData.order_num}
                        onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
                        required
                    />
                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
