'use client';

import { useState, useEffect } from 'react';
import { Teacher } from '@/types';
import { teacherService } from '@/services/teacher.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        image_url: '',
        profession: { uz: '', ru: '', en: '' },
        bio: { uz: '', ru: '', en: '' },
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
            first_name: '',
            last_name: '',
            image_url: '',
            profession: { uz: '', ru: '', en: '' },
            bio: { uz: '', ru: '', en: '' },
        });
        setIsModalOpen(true);
    };

    const handleEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            image_url: teacher.image_url || '',
            profession: teacher.profession || { uz: '', ru: '', en: '' },
            bio: teacher.bio || { uz: '', ru: '', en: '' },
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

        try {
            if (editingTeacher) {
                await teacherService.update(editingTeacher.id, formData);
            } else {
                await teacherService.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Failed to save teacher:', error);
            alert('Failed to save teacher');
        }
    };

    const columns = [
        { key: 'id', header: 'ID' },
        {
            key: 'name',
            header: 'Name',
            render: (item: Teacher) => `${item.first_name} ${item.last_name}`
        },
        {
            key: 'profession',
            header: 'Profession',
            render: (item: Teacher) => item.profession?.en || item.profession?.uz || item.profession?.ru || '-'
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
                        label="First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                    />
                    <Input
                        label="Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                    />
                    <Input
                        label="Image URL"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    <MultilangInput
                        label="Profession"
                        value={formData.profession}
                        onChange={(profession) => setFormData({ ...formData, profession })}
                    />
                    <MultilangInput
                        label="Bio"
                        value={formData.bio}
                        onChange={(bio) => setFormData({ ...formData, bio })}
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
