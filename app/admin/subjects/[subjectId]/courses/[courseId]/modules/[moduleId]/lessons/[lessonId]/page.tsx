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
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

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
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    order_num: 1,
    type: 'video', // 'video' | 'pdf' | 'article'
    title: { uz: '', ru: '', en: '' },
    link_url: '',
  });

  useEffect(() => {
    if (subjectId && courseId && moduleId && lessonId) {
      loadData();
    }
  }, [subjectId, courseId, moduleId, lessonId]);

  const loadData = async () => {
    try {
      const [subjectData, courseData, moduleData, lessonData, sourcesResponse] = await Promise.all([
        subjectService.getById(subjectId),
        courseService.getById(courseId),
        moduleService.getById(moduleId),
        lessonService.getById(lessonId),
        sourceService.getAll(lessonId),
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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSource(null);
    setFormData({
      lesson_id: lessonId,
      order_num: sources.length + 1,
      type: 'video',
      title: { uz: '', ru: '', en: '' },
      link_url: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({
      lesson_id: source.lesson_id || lessonId, // Fallback if missing?
      order_num: source.order_num,
      type: source.type,
      title: source.title,
      link_url: source.link_url,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSource) {
        await sourceService.update(editingSource.id, formData);
      } else {
        await sourceService.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save source:', error);
      alert('Failed to save source');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subject || !course || !module || !lesson) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Subjects', href: '/admin/subjects' },
    { label: subject.name.en || subject.name.uz || subject.name.ru, href: `/admin/subjects/${subjectId}` },
    { label: course.title.en || course.title.uz || course.title.ru, href: `/admin/subjects/${subjectId}/courses/${courseId}` },
    { label: module.title.en || module.title.uz || module.title.ru, href: `/admin/subjects/${subjectId}/courses/${courseId}/modules/${moduleId}` },
    { label: lesson.title.en || lesson.title.uz || lesson.title.ru },
  ];

  const sourceTypeOptions = [
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
    { value: 'article', label: 'Article' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lesson.title.en || lesson.title.uz || lesson.title.ru}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">{lesson.duration} minutes</span>
          </div>
        </div>
        <Button onClick={handleCreate}>Add Source</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            {sources.length === 0
              ? 'No sources in this lesson yet'
              : `${sources.length} source${sources.length !== 1 ? 's' : ''} in this lesson`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No sources available</p>
              <Button onClick={handleCreate}>Create your first source</Button>
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
                              {source.title.en || source.title.uz || source.title.ru}
                            </h3>
                            <a
                              href={source.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                            >
                              {source.link_url}
                            </a>
                          </div>
                          <Badge variant="outline">{source.type}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(source)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(source)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSource ? 'Edit Source' : 'Add Source'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Title"
            value={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            required
          />
          <Input
            label="Link URL"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="https://..."
            required
          />
          <Select
            label="Type"
            options={sourceTypeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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

