'use client';

import { useState, useEffect } from 'react';
import { Teacher } from '@/types';
import { teacherService } from '@/services/teacher.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        login: '',
        phone_number: '',
        password: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await teacherService.getAll();
            setTeachers(response.data);
        } catch (error) {
            console.error('Failed to load teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTeacher(null);
        setFormData({
            name: '',
            login: '',
            phone_number: '',
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            login: teacher.login,
            phone_number: teacher.phone_number,
            password: '', // Password not editable directly or leave empty to keep same if backend supports
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (teacher: Teacher) => {
        if (!confirm('Are you sure you want to delete this teacher?')) {
            return;
        }

        try {
            await teacherService.delete(teacher.id);
            loadData();
        } catch (error) {
            console.error('Failed to delete teacher:', error);
            alert('Failed to delete teacher');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sending teacher data:', formData);

        try {
            if (editingTeacher) {
                await teacherService.update(editingTeacher.id, formData);
            } else {
                await teacherService.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to save teacher:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to save teacher';
            alert(`Error: ${message}`);
        }
    };

    const columns = [
        { key: 'id', header: 'ID' },
        {
            key: 'name',
            header: 'Name',
            render: (item: Teacher) => item.name
        },
        {
            key: 'login',
            header: 'Login',
            render: (item: Teacher) => item.login
        },
        {
            key: 'phone_number',
            header: 'Phone Number',
            render: (item: Teacher) => item.phone_number
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: Teacher) => (
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
                <h1 className="text-3xl font-bold">Teachers</h1>
                <Button onClick={handleCreate}>Add Teacher</Button>
            </div>

            <Table data={teachers} columns={columns} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Login"
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        required
                    />
                    <Input
                        label="Phone Number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        required
                    />
                    {!editingTeacher && (
                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    )}
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
