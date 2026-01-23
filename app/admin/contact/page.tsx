'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { contactService } from '@/services/contact.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
    const [items, setItems] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

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

    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'phone', header: 'Phone' },
        { key: 'message', header: 'Message' },
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
            <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
            <Table data={items} columns={columns} />
        </div>
    );
}
