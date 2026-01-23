'use client';

import { useState, useEffect } from 'react';
import { Notification } from '@/types';
import { notificationService } from '@/services/notification.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState({
    title: { uz: '', ru: '', en: '' },
    message: { uz: '', ru: '', en: '' },
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      title: { uz: '', ru: '', en: '' },
      message: { uz: '', ru: '', en: '' }
    });
    setIsModalOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (notification: Notification) => {
    if (!confirm(`Are you sure you want to delete this notification?`)) {
      return;
    }

    try {
      await notificationService.delete(notification.id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const notifData = {
      title: formData.title,
      message: formData.message,
      type: 'info',
    };

    try {
      if (editingNotification) {
        await notificationService.update(editingNotification.id, notifData);
      } else {
        await notificationService.create(notifData);
      }
      setIsModalOpen(false);
      loadNotifications();
    } catch (error) {
      console.error('Failed to save notification:', error);
      alert('Failed to save notification');
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

