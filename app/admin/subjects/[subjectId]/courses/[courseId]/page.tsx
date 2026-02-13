'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Subject, Course, Module } from '@/types';
import { subjectService } from '@/services/subject.service';
import { courseService } from '@/services/course.service';
import { moduleService } from '@/services/module.service';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const courseId = params.courseId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    course_id: courseId,
    order_num: 1,
    name: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
  });

  useEffect(() => {
    if (subjectId && courseId) {
      loadData();
    }
  }, [subjectId, courseId, activeFilters, page]);


  const loadData = async () => {
    try {
      const [subjectData, courseData, modulesResponse] = await Promise.all([
        subjectService.getById(subjectId),
        courseService.getById(courseId),
        moduleService.getAll(courseId, page, limit, activeFilters),
      ]);


      if (!subjectData || !courseData) {
        router.push('/admin/subjects');
        return;
      }

      setSubject(subjectData);
      setCourse(courseData);
      setModules(modulesResponse.data);
      setTotalItems(modulesResponse.meta?.total_items || 0);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModule(null);
    setFormData({
      course_id: courseId,
      order_num: modules.length + 1,
      name: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      course_id: module.course_id,
      order_num: module.order_num,
      name: module.name,
      description: module.description || { uz: '', ru: '', en: '' }, // Handle optional description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (module: Module) => {
    if (!confirm(`Ushbu modulni o'chirishni xohlaysizmi?`)) {
      return;
    }

    try {
      await moduleService.delete(module.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete module:', error);
      alert('Modulni o\'chirishda xatolik');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingModule) {
        await moduleService.update(editingModule.id, formData);
      } else {
        await moduleService.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save module:', error);
      alert('Modulni saqlashda xatolik');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!subject || !course) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Fanlar', href: '/admin/subjects' },
    { label: subject?.name?.en || subject?.name?.uz || subject?.name?.ru || 'Nomsiz fan', href: `/admin/subjects/${subjectId}` },
    { label: course?.name?.en || course?.name?.uz || course?.name?.ru || 'Nomsiz kurs' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {course?.name?.en || course?.name?.uz || course?.name?.ru || 'Nomsiz kurs'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {course?.description?.en || course?.description?.uz || course?.description?.ru || ''}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={course?.is_active ? 'success' : 'secondary'}>
              {course?.is_active ? 'Faol' : 'Faol emas'}
            </Badge>
          </div>
        </div>
        <Button onClick={handleCreate}>Modul qo'shish</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Modullar</CardTitle>
              <CardDescription>
                {modules.length === 0
                  ? 'Ushbu kursda modullar mavjud emas'
                  : `${modules.length} ta modul ushbu kursda`}
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <SearchFilters
              configs={[{ key: 'name', label: 'Modul nomi', type: 'text', placeholder: 'Modul nomi bo\'yicha qidirish...' }]}
              onFilter={setActiveFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Modullar topilmadi</p>
              <Button onClick={handleCreate}>Birinchi modulni yaratish</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {modules
                .sort((a, b) => a.order_num - b.order_num)
                .map((module) => (
                  <Card key={module.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                            {module.order_num}
                          </div>
                          <Link
                            href={`/admin/subjects/${subjectId}/courses/${courseId}/modules/${module.id}`}
                            className="flex-1"
                          >
                            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                              {module.name?.en || module.name?.uz || module.name?.ru || 'Nomsiz modul'}
                            </h3>
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(module)}
                            variant="outline"
                            size="sm"
                          >
                            Tahrirlash
                          </Button>
                          <Button
                            onClick={() => handleDelete(module)}
                            variant="destructive"
                            size="sm"
                          >
                            O'chirish
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
      />


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModule ? 'Modulni tahrirlash' : 'Modul qo\'shish'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Nom"
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
            required
          />
          <MultilangInput
            label="Tavsif"
            value={formData.description}
            onChange={(description) => setFormData({ ...formData, description })}
          />
          <Input
            label="Tartib raqami"
            type="number"
            value={formData.order_num}
            onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
            required
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

