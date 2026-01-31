'use client';

import { useState, useEffect } from 'react';
import { Notification, Course } from '@/types';
import { notificationService } from '@/services/notification.service';
import { courseService } from '@/services/course.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState({
    course_id: '',
    title: { uz: '', ru: '', en: '' },
    message: { uz: '', ru: '', en: '' },
    targetType: 'all' // 'all' | 'course'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifsResponse, coursesResponse] = await Promise.all([
        notificationService.getAll(),
        courseService.getAll()
      ]);
      setNotifications(notifsResponse.data);
      setCourses(coursesResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      course_id: '',
      title: { uz: '', ru: '', en: '' },
      message: { uz: '', ru: '', en: '' },
      targetType: 'all'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      course_id: notification.course_id || '',
      title: notification.title,
      message: notification.message,
      targetType: notification.course_id ? 'course' : 'all'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (notification: Notification) => {
    if (!confirm(`Are you sure you want to delete this notification?`)) {
      return;
    }

    try {
      await notificationService.delete(notification.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.targetType === 'course' && (!formData.course_id || formData.course_id.trim() === '')) {
      alert('Please select a course when targeting specific course notifications');
      return;
    }

    // Validate multilanguage fields - ensure no empty strings
    const titleUz = formData.title.uz?.trim() || '';
    const titleRu = formData.title.ru?.trim() || '';
    const titleEn = formData.title.en?.trim() || '';
    const messageUz = formData.message.uz?.trim() || '';
    const messageRu = formData.message.ru?.trim() || '';
    const messageEn = formData.message.en?.trim() || '';

    if (!titleUz || !titleRu || !titleEn) {
      alert('Please fill in the title in all languages (UZ, RU, EN)');
      return;
    }

    if (!messageUz || !messageRu || !messageEn) {
      alert('Please fill in the message in all languages (UZ, RU, EN)');
      return;
    }

    // Clean the data
    const cleanTitle = { uz: titleUz, ru: titleRu, en: titleEn };
    const cleanMessage = { uz: messageUz, ru: messageRu, en: messageEn };

    try {
      const payload: any = {
        title: cleanTitle,
        message: cleanMessage,
        type: formData.targetType === 'course' ? 'selected' : 'all', // Add required type field
      };

      // Only add course_id if it's for a specific course (don't send null/undefined)
      if (formData.targetType === 'course' && formData.course_id && formData.course_id.trim() !== '') {
        payload.course_id = formData.course_id.trim();
      } else if (formData.targetType === 'all') {
        // Explicitly don't include course_id for all users
        // The API should handle this, but we ensure it's not sent
      }

      if (editingNotification) {
        await notificationService.update(editingNotification.id, payload);
      } else {
        await notificationService.create(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to save notification:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save notification';
      alert(`Error: ${errorMessage}`);
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'title',
      header: 'Title',
      render: (item: Notification) => item.title.uz || item.title.en
    },
    {
      key: 'message',
      header: 'Message',
      render: (item: Notification) => (
        <div className="max-w-md truncate">{item.message.uz || item.message.en}</div>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      render: (item: Notification) => item.course_id ? 'Specific Course' : 'All Users'
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (item: Notification) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Notification) => (
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

  const courseOptions = [
    ...courses.map(c => ({ value: c.id, label: c.name?.en || c.name?.uz || c.name?.ru || 'Untitled Course' }))
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button onClick={handleCreate}>Create Notification</Button>
      </div>

      <Table
        data={notifications}
        columns={columns}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotification ? 'Edit Notification' : 'Create Notification'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={formData.targetType === 'all'}
                  onChange={() => setFormData({ ...formData, targetType: 'all', course_id: '' })}
                />
                All Users
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="targetType"
                  value="course"
                  checked={formData.targetType === 'course'}
                  onChange={() => setFormData({ ...formData, targetType: 'course' })}
                />
                Selected Course
              </label>
            </div>
          </div>

          {formData.targetType === 'course' && (
            <Select
              label="Course"
              options={courseOptions}
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              required
            />
          )}
          <MultilangInput
            label="Title"
            value={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            required
          />
          <MultilangInput
            label="Message"
            value={formData.message}
            onChange={(message) => setFormData({ ...formData, message })}
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

