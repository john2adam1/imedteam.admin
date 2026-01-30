'use client';

import { useState, useEffect } from 'react';
import { AppRoute } from '@/types';
import { appRouteService } from '@/services/app-route.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AppRoutesPage() {
    const [appRoutes, setAppRoutes] = useState<AppRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<AppRoute | null>(null);
    const [formData, setFormData] = useState({
        key: '',
        value: '',
        description: '',
        order_num: 1,
    });

    useEffect(() => {
        loadAppRoutes();
    }, []);

    const loadAppRoutes = async () => {
        try {
            const response = await appRouteService.getAll();
            setAppRoutes(response.app_routes || []);
        } catch (error) {
            console.error('Failed to load app routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRoute(null);
        setFormData({
            key: '',
            value: '',
            description: '',
            order_num: appRoutes.length + 1,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (route: AppRoute) => {
        setEditingRoute(route);
        setFormData({
            key: route.key,
            value: typeof route.value === 'string' ? route.value : JSON.stringify(route.value, null, 2),
            description: route.description || '',
            order_num: route.order_num,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (route: AppRoute) => {
        if (!confirm('Are you sure you want to delete this app route?')) {
            return;
        }

        try {
            await appRouteService.delete(route.id);
            loadAppRoutes();
        } catch (error) {
            console.error('Failed to delete app route:', error);
            alert('Failed to delete app route');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse JSON value
        let parsedValue;
        try {
            parsedValue = JSON.parse(formData.value);
        } catch (error) {
            alert('Invalid JSON in value field');
            return;
        }

        const routeData = {
            key: formData.key,
            value: parsedValue,
            description: formData.description || undefined,
            order_num: formData.order_num,
        };

        try {
            if (editingRoute) {
                await appRouteService.update(editingRoute.id, routeData);
            } else {
                await appRouteService.create(routeData);
            }
            setIsModalOpen(false);
            loadAppRoutes();
        } catch (error: any) {
            console.error('Failed to save app route:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save app route';
            alert(`Error: ${errorMessage}`);
        }
    };

    const columns = [
        { key: 'key', header: 'Key' },
        {
            key: 'value',
            header: 'Value',
            render: (item: AppRoute) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {typeof item.value === 'string' ? item.value : JSON.stringify(item.value).substring(0, 50) + '...'}
                </code>
            ),
        },
        { key: 'description', header: 'Description' },
        { key: 'order_num', header: 'Order' },
        {
            key: 'created_at',
            header: 'Created At',
            render: (item: AppRoute) => new Date(item.created_at).toLocaleDateString(),
        },
    ];

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">App Routes</h1>
                <Button onClick={handleCreate}>Create App Route</Button>
            </div>

            <Table
                data={appRoutes}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRoute ? 'Edit App Route' : 'Create App Route'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Key"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        placeholder="e.g., home_banner"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Value (JSON) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full border rounded-md p-2 font-mono text-sm"
                            rows={6}
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder='{"example": "value"}'
                            required
                        />
                    </div>
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description"
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
