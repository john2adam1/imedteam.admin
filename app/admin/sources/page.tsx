'use client';

import { useState, useEffect } from 'react';
import { Source, Lesson } from '@/types';
import { sourceService } from '@/services/source.service';
import { lessonService } from '@/services/lesson.service';
import { uploadService } from '@/services/upload.service';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [filteredSources, setFilteredSources] = useState<Source[]>([]);

  const [formData, setFormData] = useState({
    lesson_id: '',
    name: { uz: '', ru: '', en: '' },
    url: { uz: '', ru: '', en: '' },
    type: 'video' as 'video' | 'document' | 'test',
    order_num: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      setFilteredSources(sources.filter(s => s.lesson_id === selectedLessonId));
    } else {
      setFilteredSources(sources);
    }
  }, [selectedLessonId, sources]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sourcesResponse, lessonsResponse] = await Promise.all([
        sourceService.getAll(undefined, 1, 1000), // Get all sources
        lessonService.getAll(undefined, 1, 1000) // Get all lessons
      ]);
      setSources(sourcesResponse.data);
      setFilteredSources(sourcesResponse.data);
      setLessons(lessonsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type: 'video' | 'document' | 'test' = 'video') => {
    setEditingSource(null);
    setFormData({
      lesson_id: selectedLessonId || '',
      name: { uz: '', ru: '', en: '' },
      url: { uz: '', ru: '', en: '' },
      type,
      order_num: filteredSources.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({
      lesson_id: source.lesson_id,
      name: source.name,
      url: source.url,
      type: source.type,
      order_num: source.order_num,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (source: Source) => {
    if (!confirm(`Are you sure you want to delete this source?`)) {
      return;
    }

    try {
      await sourceService.delete(source.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete source:', error);
      alert('Failed to delete source');
    }
  };

  const handleFileUpload = async (file: File, language: 'uz' | 'ru' | 'en') => {
    try {
      setUploading(true);
      const uploadResult = await uploadService.upload(file);
      setFormData({
        ...formData,
        url: {
          ...formData.url,
          [language]: uploadResult.url,
        },
      });
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.lesson_id || formData.lesson_id.trim() === '') {
      alert('Please select a lesson');
      return;
    }

    // Validate multilanguage fields
    const nameUz = formData.name.uz?.trim() || '';
    const nameRu = formData.name.ru?.trim() || '';
    const nameEn = formData.name.en?.trim() || '';

    if (!nameUz || !nameRu || !nameEn) {
      alert('Please fill in the name in all languages (UZ, RU, EN)');
      return;
    }

    // At least one URL should be provided
    const urlUz = formData.url.uz?.trim() || '';
    const urlRu = formData.url.ru?.trim() || '';
    const urlEn = formData.url.en?.trim() || '';

    if (!urlUz && !urlRu && !urlEn) {
      alert('Please provide at least one URL or upload a file');
      return;
    }

    try {
      const payload = {
        lesson_id: formData.lesson_id,
        name: { uz: nameUz, ru: nameRu, en: nameEn },
        url: { uz: urlUz, ru: urlRu, en: urlEn },
        type: formData.type,
        order_num: formData.order_num,
      };

      if (editingSource) {
        await sourceService.update(editingSource.id, payload);
      } else {
        await sourceService.create(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save source:', error);
      alert('Failed to save source');
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'lesson',
      header: 'Lesson',
      render: (item: Source) => {
        const lesson = lessons.find(l => l.id === item.lesson_id);
        return lesson ? (lesson.name?.en || lesson.name?.uz || lesson.name?.ru || 'Unknown') : 'Unknown';
      },
    },
    {
      key: 'name',
      header: 'Name',
      render: (item: Source) => item.name.uz || item.name.en || item.name.ru
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Source) => (
        <span className={`px-2 py-1 rounded text-xs ${item.type === 'video' ? 'bg-blue-100 text-blue-800' :
            item.type === 'document' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
          }`}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
      ),
    },
    {
      key: 'url',
      header: 'URL',
      render: (item: Source) => (
        <a
          href={item.url.uz || item.url.en || item.url.ru}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate max-w-xs"
        >
          {item.url.uz || item.url.en || item.url.ru || 'No URL'}
        </a>
      ),
    },
    {
      key: 'order_num',
      header: 'Order',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Source) => (
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

  const lessonOptions = lessons.map(l => ({
    value: l.id,
    label: l.name?.en || l.name?.uz || l.name?.ru || 'Untitled Lesson'
  }));

  const sourceTypeOptions = [
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document (PDF)' },
    { value: 'test', label: 'Test (PDF)' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sources</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleCreate('video')}>Add Video</Button>
          <Button onClick={() => handleCreate('document')} variant="outline">Add Document</Button>
          <Button onClick={() => handleCreate('test')} variant="secondary">Add Test</Button>
        </div>
      </div>

      <div className="mb-4">
        <Select
          label="Filter by Lesson"
          options={[
            { value: '', label: 'All Lessons' },
            ...lessonOptions
          ]}
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
        />
      </div>

      <Table
        data={filteredSources}
        columns={columns}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSource ? 'Edit Source' : 'Create Source'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Lesson"
            options={lessonOptions}
            value={formData.lesson_id}
            onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
            required
          />

          <Select
            label="Type"
            options={sourceTypeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'video' | 'document' | 'test' })}
            required
          />

          <MultilangInput
            label="Name"
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
            required
          />

          <div className="space-y-4">
            <label className="text-sm font-medium">URLs or Upload Files</label>
            {(['uz', 'ru', 'en'] as const).map((lang) => (
              <div key={lang} className="space-y-2">
                <label className="text-xs font-medium uppercase">{lang}</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={formData.url[lang] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      url: { ...formData.url, [lang]: e.target.value }
                    })}
                    placeholder={`Enter ${lang.toUpperCase()} URL or upload file`}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    id={`file-upload-${lang}`}
                    accept={formData.type === 'video' ? 'video/*' : 'application/pdf'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, lang);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`file-upload-${lang}`)?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
