'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { contactService } from '@/services/contact.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
    const [items, setItems] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        link_url: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await contactService.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: Contact) => {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            await contactService.delete(item.id);
            loadData();
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message');
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
        } catch (error) {
            console.error('Failed to save contact:', error);
            alert('Failed to save contact');
        }
    };

    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'phone_number', header: 'Phone' },
        { key: 'link_url', header: 'Link' },
        {
            key: 'created_at',
            header: 'Date',
            render: (item: Contact) => new Date(item.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: Contact) => (
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
                <h1 className="text-3xl font-bold">Contacts</h1>
                <Button onClick={handleCreate}>Add Contact</Button>
            </div>

            <Table data={items} columns={columns} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingContact ? 'Edit Contact' : 'Add Contact'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Phone Number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        required
                    />
                    <Input
                        label="Link URL"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
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
