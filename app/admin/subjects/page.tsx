'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Subject } from '@/types';
import { subjectService } from '@/services/subject.service';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [formData, setFormData] = useState({

    image_url: '',
    order_num: 1,
    name: { uz: '', ru: '', en: '' },
  });

  useEffect(() => {
    loadSubjects();
  }, [activeFilters, page]);


  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getAll(page, limit, activeFilters);
      setSubjects(response.data);
      setTotalItems(response.meta?.total_items || response.data.length);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setFormData({
      image_url: '',
      order_num: subjects.length + 1,
      name: { uz: '', ru: '', en: '' },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      image_url: subject.image_url,
      order_num: subject.order_num,
      name: subject.name,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete this subject?`)) {
      return;
    }

    try {
      await subjectService.delete(subject.id);
      loadSubjects();
    } catch (error) {
      console.error('Failed to delete subject:', error);
      alert('Failed to delete subject');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.id, formData);
      } else {
        await subjectService.create(formData);
      }
      setIsModalOpen(false);
      loadSubjects();
    } catch (error) {
      console.error('Failed to save subject:', error);
      alert('Failed to save subject');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Subjects' }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your content subjects
          </p>
        </div>
        <Button onClick={handleCreate}>Create Subject</Button>
      </div>

      <SearchFilters
        configs={[{ key: 'name', label: 'Name', type: 'text', placeholder: 'Search by name...' }]}
        onFilter={setActiveFilters}
      />

      <Separator />

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No subjects available</p>
            <Button onClick={handleCreate}>Create your first subject</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects
            .sort((a, b) => a.order_num - b.order_num)
            .map((subject) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/admin/subjects/${subject.id}`}>
                        <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                          {subject.name.en || subject.name.uz || subject.name.ru}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-1">
                        Order: {subject.order_num}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(subject)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(subject)}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
      />


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Create Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Name"
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
            required
          />
          <Input
            label="Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            required
          />
          <Input
            label="Order Number"
            type="number"
            value={formData.order_num}
            onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
            required
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

