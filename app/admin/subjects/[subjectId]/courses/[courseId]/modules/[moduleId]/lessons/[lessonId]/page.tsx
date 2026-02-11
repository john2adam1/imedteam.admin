'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Subject, Course, Module, Lesson, Source } from '@/types';
import { subjectService } from '@/services/subject.service';
import { courseService } from '@/services/course.service';
import { moduleService } from '@/services/module.service';
import { lessonService } from '@/services/lesson.service';
import { sourceService } from '@/services/source.service';
import { uploadService } from '@/services/upload.service';
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

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [uploading, setUploading] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    order_num: 1,
    type: 'video', // 'video' | 'document' | 'test'
    name: { uz: '', ru: '', en: '' },
    url: { uz: '', ru: '', en: '' },
  });

  useEffect(() => {
    if (subjectId && courseId && moduleId && lessonId) {
      loadData();
    }
  }, [subjectId, courseId, moduleId, lessonId, activeFilters, page]);


  const loadData = async () => {
    try {
      const [subjectData, courseData, moduleData, lessonData, sourcesResponse] = await Promise.all([
        subjectService.getById(subjectId),
        courseService.getById(courseId),
        moduleService.getById(moduleId),
        lessonService.getById(lessonId),
        sourceService.getAll(lessonId, page, limit, activeFilters),
      ]);


      if (!subjectData || !courseData || !moduleData || !lessonData) {
        router.push('/admin/subjects');
        return;
      }

      setSubject(subjectData);
      setCourse(courseData);
      setModule(moduleData);
      setLesson(lessonData);
      setSources(sourcesResponse.data);
      setTotalItems(sourcesResponse.meta?.total_items || sourcesResponse.data.length);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type: 'video' | 'document' | 'test' = 'video') => {
    setEditingSource(null);
    setFormData({
      lesson_id: lessonId,
      order_num: sources.length + 1,
      type,
      name: { uz: '', ru: '', en: '' },
      url: { uz: '', ru: '', en: '' },
    });
    setIsModalOpen(true);
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
      alert('Fayl muvaffaqiyatli yuklandi!');
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Fayl yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({
      lesson_id: source.lesson_id || lessonId, // Fallback if missing?
      order_num: source.order_num,
      type: source.type,
      name: source.name,
      url: source.url,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (source: Source) => {
    if (!confirm(`Ushbu manbani o'chirishni xohlaysizmi?`)) {
      return;
    }

    try {
      await sourceService.delete(source.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete source:', error);
      alert('Manbani o\'chirishda xatolik');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSource) {
        await sourceService.update(editingSource.id, {
          ...formData,
          type: formData.type as 'video' | 'document' | 'test'
        });
      } else {
        await sourceService.create({
          ...formData,
          type: formData.type as 'video' | 'document' | 'test'
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save source:', error);
      alert('Manbani saqlashda xatolik');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!subject || !course || !module || !lesson) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Fanlar', href: '/admin/subjects' },
    { label: subject?.name?.en || subject?.name?.uz || subject?.name?.ru || 'Nomsiz fan', href: `/admin/subjects/${subjectId}` },
    { label: course?.name?.en || course?.name?.uz || course?.name?.ru || 'Nomsiz kurs', href: `/admin/subjects/${subjectId}/courses/${courseId}` },
    { label: module?.name?.en || module?.name?.uz || module?.name?.ru || 'Nomsiz modul', href: `/admin/subjects/${subjectId}/courses/${courseId}/modules/${moduleId}` },
    { label: lesson?.name?.en || lesson?.name?.uz || lesson?.name?.ru || 'Nomsiz dars' },
  ];

  const sourceTypeOptions = [
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Hujjat' },
    { value: 'test', label: 'Test' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lesson?.name?.en || lesson?.name?.uz || lesson?.name?.ru || 'Nomsiz dars'}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">{lesson.duration} daqiqa</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleCreate('video')}>Video qo'shish</Button>
          <Button onClick={() => handleCreate('document')} variant="outline">Hujjat qo'shish</Button>
          <Button onClick={() => handleCreate('test')} variant="secondary">Test qo'shish</Button>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manbalar</CardTitle>
              <CardDescription>
                {sources.length === 0
                  ? 'Ushbu darsda manbalar mavjud emas'
                  : `${sources.length} ta manba ushbu darsda`}
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <SearchFilters
              configs={[
                { key: 'name', label: 'Manba nomi', type: 'text', placeholder: 'Manba nomi bo\'yicha qidirish...' },
                { key: 'type', label: 'Tur', type: 'select', options: [{ value: 'video', label: 'Video' }, { value: 'document', label: 'Hujjat' }, { value: 'test', label: 'Test' }] }
              ]}
              onFilter={setActiveFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Manbalar topilmadi</p>
              <Button onClick={() => handleCreate('video')}>Birinchi manbani yaratish</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sources
                .sort((a, b) => a.order_num - b.order_num)
                .map((source) => (
                  <Card key={source.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                            {source.order_num}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {source.name?.en || source.name?.uz || source.name?.ru || 'Nomsiz manba'}
                            </h3>
                            <a
                              href={source.url?.en || source.url?.uz || source.url?.ru}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                            >
                              {source.url?.en || source.url?.uz || source.url?.ru}
                            </a>
                          </div>
                          <Badge variant="outline">{source.type === 'video' ? 'Video' : source.type === 'document' ? 'Hujjat' : 'Test'}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(source)}
                            variant="outline"
                            size="sm"
                          >
                            Tahrirlash
                          </Button>
                          <Button
                            onClick={() => handleDelete(source)}
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
        title={editingSource ? 'Manbani tahrirlash' : 'Manba qo\'shish'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Nom"
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
            required
          />
          <div className="space-y-4">
            <label className="text-sm font-medium">
              {formData.type === 'video' ? 'YouTube URLlari' : 'URLlar yoki Fayl yuklash'}
            </label>
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
                    placeholder={
                      formData.type === 'video'
                        ? `${lang.toUpperCase()} YouTube URLini kiriting`
                        : `${lang.toUpperCase()} URLini kiriting yoki fayl yuklang`
                    }
                    className="flex-1"
                  />
                  {formData.type !== 'video' && (
                    <>
                      <input
                        type="file"
                        id={`file-upload-${lang}`}
                        accept="application/pdf"
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
                        {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Select
            label="Tur"
            options={sourceTypeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
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
            <Button type="submit">Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

