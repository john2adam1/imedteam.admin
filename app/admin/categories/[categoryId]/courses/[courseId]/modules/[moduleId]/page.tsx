'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, Course, Module, Lesson } from '@/types';
import { categoriesApi, coursesApi, modulesApi, lessonsApi } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    moduleId: moduleId,
    title: '',
    videoUrl: '',
    pdfResource: '',
    testPdf: '',
    isFree: true,
  });

  useEffect(() => {
    if (categoryId && courseId && moduleId) {
      loadData();
    }
  }, [categoryId, courseId, moduleId]);

  const loadData = async () => {
    try {
      const [categoryData, courseData, moduleData, lessonsData] = await Promise.all([
        categoriesApi.getById(categoryId),
        coursesApi.getById(courseId),
        modulesApi.getById(moduleId),
        lessonsApi.getAll(moduleId),
      ]);

      if (!categoryData || !courseData || !moduleData) {
        router.push('/admin/categories');
        return;
      }

      setCategory(categoryData);
      setCourse(courseData);
      setModule(moduleData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLesson(null);
    setFormData({
      moduleId: moduleId,
      title: '',
      videoUrl: '',
      pdfResource: '',
      testPdf: '',
      isFree: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      moduleId: lesson.moduleId,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      pdfResource: lesson.pdfResource,
      testPdf: lesson.testPdf,
      isFree: lesson.isFree,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      return;
    }

    try {
      await lessonsApi.delete(lesson.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLesson) {
        await lessonsApi.update(editingLesson.id, formData);
      } else {
        await lessonsApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Failed to save lesson');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!category || !course || !module) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Categories', href: '/admin/categories' },
    { label: category.name, href: `/admin/categories/${categoryId}` },
    { label: course.title, href: `/admin/categories/${categoryId}/courses/${courseId}` },
    { label: module.title },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
          <p className="text-muted-foreground mt-1">Manage lessons in this module</p>
        </div>
        <Button onClick={handleCreate}>Add Lesson</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
          <CardDescription>
            {lessons.length === 0
              ? 'No lessons in this module yet'
              : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''} in this module`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No lessons available</p>
              <Button onClick={handleCreate}>Create your first lesson</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Link
                          href={`/admin/categories/${categoryId}/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                          className="flex-1"
                        >
                          <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                            {lesson.title}
                          </h3>
                        </Link>
                        <Badge variant={lesson.isFree ? 'success' : 'secondary'}>
                          {lesson.isFree ? 'Free' : 'Paid'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(lesson)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(lesson)}
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
        title={editingLesson ? 'Edit Lesson' : 'Add Lesson'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Video URL"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            placeholder="YouTube, Vimeo, or direct video URL"
            required
          />
          <Input
            label="PDF Resource URL"
            value={formData.pdfResource}
            onChange={(e) => setFormData({ ...formData, pdfResource: e.target.value })}
            placeholder="URL to PDF resource"
          />
          <Input
            label="Test PDF URL"
            value={formData.testPdf}
            onChange={(e) => setFormData({ ...formData, testPdf: e.target.value })}
            placeholder="URL to test PDF"
          />
          <Checkbox
            label="Free Lesson"
            checked={formData.isFree}
            onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
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
