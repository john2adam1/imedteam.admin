'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { contactService } from '@/services/contact.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

export default function ContactPage() {
    const [items, setItems] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        link_url: '',
    });

    useEffect(() => {
        loadData();
    }, [activeFilters, page]);


    const loadData = async () => {
        try {
            setLoading(true);
            const response = await contactService.getAll(page, limit, activeFilters);
            setItems(response.data);
            setTotalItems(response.meta?.total_items || 0);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: Contact) => {
        if (!confirm('Ushbu xabarni o\'chirishni xohlaysizmi?')) {
            return;
        }

        try {
            await contactService.delete(item.id);
            loadData();
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Xabarni o\'chirishda xatolik');
        }
    };

    const handleCreate = () => {
        setEditingContact(null);
        setFormData({
            name: '',
            phone_number: '',
            link_url: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            phone_number: contact.phone_number,
            link_url: contact.link_url || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingContact) {
                await contactService.update(editingContact.id, formData);
            } else {
                await contactService.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to save contact:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Aloqani saqlashda xatolik';
            alert(`Xatolik: ${errorMessage}`);
        }
    };

    const columns = [
        { key: 'name', header: 'Ism' },
        { key: 'phone_number', header: 'Telefon' },
        { key: 'link_url', header: 'Havola' },
        {
            key: 'created_at',
            header: 'Sana',
            render: (item: Contact) => new Date(item.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: 'Amallar',
            render: (item: Contact) => (
                <div className="flex gap-2">
                    <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                        Tahrirlash
                    </Button>
                    <Button onClick={() => handleDelete(item)} variant="destructive" size="sm">
                        O'chirish
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <div className="text-center py-8">Yuklanmoqda...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Aloqa</h1>
                <Button onClick={handleCreate}>Aloqa qo'shish</Button>
            </div>

            <SearchFilters
                configs={[
                    { key: 'name', label: 'Ism', type: 'text', placeholder: 'Ism bo\'yicha qidirish...' },
                    { key: 'phone_number', label: 'Telefon', type: 'text', placeholder: 'Telefon bo\'yicha qidirish...' }
                ]}
                onFilter={setActiveFilters}
            />

            <Table data={items} columns={columns} />

            <Pagination
                currentPage={page}
                totalItems={totalItems}
                perPage={limit}
                onPageChange={setPage}
            />


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingContact ? 'Aloqani tahrirlash' : 'Aloqa qo\'shish'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Ism"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Telefon raqami"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        required
                    />
                    <Input
                        label="Havola URL"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    />
                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Bekor qilish
                        </Button>
                        <Button type="submit">Saqlash</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
