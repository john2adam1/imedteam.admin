'use client';

import { useState, useEffect } from 'react';
import { FAQ } from '@/types';
import { faqService } from '@/services/faq.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';

export default function FAQPage() {
    const [items, setItems] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState({
        question: { uz: '', ru: '', en: '' },
        answer: { uz: '', ru: '', en: '' },
        order_num: 1,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await faqService.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Failed to load FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem(null);
        setFormData({
            question: { uz: '', ru: '', en: '' },
            answer: { uz: '', ru: '', en: '' },
            order_num: items.length + 1,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: FAQ) => {
        setEditingItem(item);
        setFormData({
            question: item.question,
            answer: item.answer,
            order_num: item.order_num,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: FAQ) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) {
            return;
        }

        try {
            await faqService.delete(item.id);
            loadData();
        } catch (error) {
            console.error('Failed to delete FAQ:', error);
            alert('Failed to delete FAQ');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingItem) {
                await faqService.update(editingItem.id, formData);
            } else {
                await faqService.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Failed to save FAQ:', error);
            alert('Failed to save FAQ');
        }
    };

    const columns = [
        { key: 'id', header: 'ID' },
        {
            key: 'question',
            header: 'Question',
            render: (item: FAQ) => item.question.en || item.question.uz || item.question.ru
        },
        {
            key: 'order_num',
            header: 'Order',
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: FAQ) => (
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
                <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
                <Button onClick={handleCreate}>Add FAQ</Button>
            </div>

            <Table data={items} columns={columns} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit FAQ' : 'Add FAQ'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MultilangInput
                        label="Question"
                        value={formData.question}
                        onChange={(question) => setFormData({ ...formData, question })}
                        required
                    />
                    <MultilangInput
                        label="Answer"
                        value={formData.answer}
                        onChange={(answer) => setFormData({ ...formData, answer })}
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
