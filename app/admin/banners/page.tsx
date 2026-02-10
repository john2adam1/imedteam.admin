'use client';

import { useState, useEffect } from 'react';
import { Banner } from '@/types';
import { bannerService } from '@/services/banner.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Using objects for multilingual support
  const [formData, setFormData] = useState({
    image_url: { uz: '', ru: '', en: '' },
    link_url: '',
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    order_num: 1,
  });

  useEffect(() => {
    loadBanners();
  }, [activeFilters]);

  const loadBanners = async () => {
    try {
      const response = await bannerService.getAll(1, 10, activeFilters);
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      image_url: { uz: '', ru: '', en: '' },
      link_url: '',
      title: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
      order_num: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      title: banner.title,
      description: banner.description,
      order_num: banner.order_num || 1,
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
      title: formData.title,
      description: formData.description,
      order_num: formData.order_num,
    };

    try {
      if (editingBanner) {
        await bannerService.update(editingBanner.id, bannerData);
      } else {
        await bannerService.create(bannerData);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save banner';
      alert(`Error: ${errorMessage}`);
    }
  };

  const columns = [
    {
      key: 'image_url',
      header: 'Image',
      render: (item: Banner) => (
        <img src={item.image_url.en || item.image_url.uz || item.image_url.ru} alt="Banner" className="w-20 h-12 object-cover" />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (item: Banner) => item.title.en || item.title.uz || item.title.ru
    },
    { key: 'link_url', header: 'Link' },
    { key: 'order_num', header: 'Order' },
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

      <SearchFilters
        configs={[{ key: 'title', label: 'Title', type: 'text', placeholder: 'Search by title...' }]}
        onFilter={setActiveFilters}
      />

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
          <MultilangInput
            label="Title"
            value={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            required
          />
          <MultilangInput
            label="Description"
            value={formData.description}
            onChange={(description) => setFormData({ ...formData, description })}
            required
          />
          <MultilangInput
            label="Image URL"
            value={formData.image_url}
            onChange={(image_url) => setFormData({ ...formData, image_url })}
            required
          />
          <Input
            label="Link URL"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
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

