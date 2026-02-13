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
import { Pagination } from '@/components/ui/Pagination';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;


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
  }, [activeFilters, page]);


  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAll(page, limit, activeFilters);
      setBanners(response.data);
      setTotalItems(response.meta?.total_items || 0);
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
    if (!confirm('Ushbu bannerni o\'chirishni xohlaysizmi?')) {
      return;
    }

    try {
      await bannerService.delete(banner.id);
      loadBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('Bannerni o\'chirishda xatolik');
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
      const errorMessage = error?.response?.data?.message || error?.message || 'Bannerni saqlashda xatolik';
      alert(`Xatolik: ${errorMessage}`);
    }
  };

  const columns = [
    {
      key: 'image_url',
      header: 'Rasm',
      render: (item: Banner) => (
        <img src={item.image_url.en || item.image_url.uz || item.image_url.ru} alt="Banner" className="w-20 h-12 object-cover" />
      ),
    },
    {
      key: 'title',
      header: 'Sarlavha',
      render: (item: Banner) => item.title.en || item.title.uz || item.title.ru
    },
    { key: 'link_url', header: 'Havola' },
    { key: 'order_num', header: 'Tartib' },
    {
      key: 'created_at',
      header: 'Yaratilgan vaqti',
      render: (item: Banner) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Amallar',
      render: (item: Banner) => (
        <div className="flex gap-2">
          <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
            Tahrirlash
          </Button>
          <Button onClick={() => handleDelete(item)} variant="destructive" size="sm">
            O'chirish
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bannerlar</h1>
        <Button onClick={handleCreate}>Banner yaratish</Button>
      </div>

      <SearchFilters
        configs={[{ key: 'title', label: 'Sarlavha', type: 'text', placeholder: 'Sarlavha bo\'yicha qidirish...' }]}
        onFilter={setActiveFilters}
      />

      <Table
        data={banners}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
      />


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Bannerni tahrirlash' : 'Banner yaratish'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Sarlavha"
            value={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            required
          />
          <MultilangInput
            label="Tavsif"
            value={formData.description}
            onChange={(description) => setFormData({ ...formData, description })}
            required
          />
          <MultilangInput
            label="Rasm URL"
            value={formData.image_url}
            onChange={(image_url) => setFormData({ ...formData, image_url })}
            required
          />
          <Input
            label="Havola URL"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
          />
          <Input
            label="Tartib raqami"
            type="number"
            value={formData.order_num}
            onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
            required
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit">Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

