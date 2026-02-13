'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Subject, Course, Module, Lesson } from '@/types';
import { subjectService } from '@/services/subject.service';
import { courseService } from '@/services/course.service';
import { moduleService } from '@/services/module.service';
import { lessonService } from '@/services/lesson.service';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({

    module_id: moduleId,
    duration: 0,
    order_num: 1,
    name: { uz: '', ru: '', en: '' },
    type: 'lesson',
    is_public: false
  });

  useEffect(() => {
    if (subjectId && courseId && moduleId) {
      loadData();
    }
  }, [subjectId, courseId, moduleId, activeFilters, page]);


  const loadData = async () => {
    try {
      setLoading(true);
      // Critical data first
      const [subjectData, courseData, moduleData] = await Promise.all([
        subjectService.getById(subjectId),
        courseService.getById(courseId),
        moduleService.getById(moduleId),
      ]);

      if (!subjectData || !courseData || !moduleData) {
        router.push('/admin/subjects');
        return;
      }

      setSubject(subjectData);
      setCourse(courseData);
      setModule(moduleData);
      setLoading(false);

      // Load lessons separately so page doesn't crash if this fails
      loadLessons();
    } catch (error) {
      console.error('Failed to load critical data:', error);
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      setLessonsLoading(true);
      const lessonsResponse = await lessonService.getAll(moduleId, page, limit, activeFilters);
      setLessons(lessonsResponse.data);
      setTotalItems(lessonsResponse.meta?.total_items || 0);
    } catch (error) {
      console.error('Failed to load lessons:', error);
      // Optional: show toast/alert here
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLesson(null);
    setFormData({
      module_id: moduleId,
      duration: 0,
      order_num: lessons.length + 1,
      name: { uz: '', ru: '', en: '' },
      type: 'lesson',
      is_public: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      module_id: lesson.module_id,
      duration: lesson.duration || 0,
      order_num: lesson.order_num,
      name: lesson.name,
      type: (lesson.type as any) || 'lesson',
      is_public: lesson.is_public || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Ushbu darsni o'chirishni xohlaysizmi?`)) {
      return;
    }

    try {
      await lessonService.delete(lesson.id);
      loadLessons();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Darsni o\'chirishda xatolik');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        is_free: false,
        is_public: formData.is_public,
        type: formData.type as 'lesson' | 'test'
      };
      if (editingLesson) {
        await lessonService.update(editingLesson.id, payload);
      } else {
        await lessonService.create(payload);
      }
      setIsModalOpen(false);
      loadLessons();
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Darsni saqlashda xatolik: ' + (error as any)?.response?.data?.message || 'Noma\'lum xatolik');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!subject || !course || !module) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Fanlar', href: '/admin/subjects' },
    { label: subject?.name?.en || subject?.name?.uz || subject?.name?.ru || 'Nomsiz fan', href: `/admin/subjects/${subjectId}` },
    { label: course?.name?.en || course?.name?.uz || course?.name?.ru || 'Nomsiz kurs', href: `/admin/subjects/${subjectId}/courses/${courseId}` },
    { label: module?.name?.en || module?.name?.uz || module?.name?.ru || 'Nomsiz modul' },
  ];

  const lessonTypeOptions = [
    { value: 'lesson', label: 'Dars' },
    { value: 'test', label: 'Test' }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {module?.name?.en || module?.name?.uz || module?.name?.ru || 'Nomsiz modul'}
          </h1>
          <p className="text-muted-foreground mt-1">Ushbu moduldagi darslarni boshqarish</p>
        </div>
        <Button onClick={handleCreate}>Dars qo'shish</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Darslar</CardTitle>
              <CardDescription>
                {lessonsLoading ? 'Darslar yuklanmoqda...' :
                  lessons.length === 0
                    ? 'Ushbu modulda darslar mavjud emas'
                    : `${lessons.length} ta dars ushbu modulda`}
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <SearchFilters
              configs={[
                { key: 'name', label: 'Dars nomi', type: 'text', placeholder: 'Dars nomi bo\'yicha qidirish...' },
                { key: 'type', label: 'Tur', type: 'select', options: [{ value: 'lesson', label: 'Dars' }, { value: 'test', label: 'Test' }] }
              ]}
              onFilter={setActiveFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {lessonsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Darslar yuklanmoqda...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Darslar topilmadi</p>
              <Button onClick={handleCreate}>Birinchi darsni yaratish</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons
                .sort((a, b) => a.order_num - b.order_num)
                .map((lesson) => (
                  <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Link
                            href={`/admin/subjects/${subjectId}/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                            className="flex-1"
                          >
                            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                              {lesson.name?.en || lesson.name?.uz || lesson.name?.ru || 'Nomsiz dars'}
                            </h3>
                          </Link>
                          <span className="text-sm text-muted-foreground">{lesson.duration || 0} daqiqa</span>
                          <Badge variant="outline">{lesson.type === 'lesson' ? 'Dars' : 'Test'}</Badge>
                          {lesson.is_public && <Badge variant="secondary">Ommaviy</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(lesson)}
                            variant="outline"
                            size="sm"
                          >
                            Tahrirlash
                          </Button>
                          <Button
                            onClick={() => handleDelete(lesson)}
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
        title={editingLesson ? 'Darsni tahrirlash' : 'Dars qo\'shish'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Nom"
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
            required
          />
          <Select
            label="Tur"
            options={lessonTypeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
          <Input
            label="Davomiyligi (daqiqada)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Tartib raqami"
            type="number"
            value={formData.order_num}
            onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_public" className="text-sm font-medium">
              Ommaviy (barcha foydalanuvchilar ko'rishi mumkin)
            </label>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit">Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

