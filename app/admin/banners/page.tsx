'use client';

import { useState, useEffect } from 'react';
import { Banner } from '@/types';
import { bannerService } from '@/services/banner.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Using simple strings for UI, converting to MultilangText on save
  const [formData, setFormData] = useState({
    image_url: '',
    link_url: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await bannerService.getAll();
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({ image_url: '', link_url: '', title: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      title: banner.title.uz || banner.title.en || '', // Pick one for display/edit
      description: banner.description.uz || banner.description.en || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      await bannerService.delete(banner.id);
      loadBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bannerData = {
      image_url: formData.image_url,
      link_url: formData.link_url,
      title: { uz: formData.title, en: formData.title, ru: formData.title }, // Replicating for all langs
      description: { uz: formData.description, en: formData.description, ru: formData.description },
      order_num: 1, // Default
    };

    try {
      if (editingBanner) {
        await bannerService.update(editingBanner.id, bannerData);
      } else {
        await bannerService.create(bannerData);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Failed to save banner');
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'image_url',
      header: 'Image',
      render: (item: Banner) => (
        <img src={item.image_url} alt="Banner" className="w-20 h-12 object-cover" />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (item: Banner) => item.title.uz || item.title.en
    },
    { key: 'link_url', header: 'Link' },
    {
      key: 'created_at',
      header: 'Created At',
      render: (item: Banner) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Button onClick={handleCreate}>Create Banner</Button>
      </div>

      <Table
        data={banners}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create Banner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Input
            label="Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            required
          />
          <Input
            label="Link URL"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
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

