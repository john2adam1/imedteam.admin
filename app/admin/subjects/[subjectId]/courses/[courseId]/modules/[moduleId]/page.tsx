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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

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
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    module_id: moduleId,
    duration: 0,
    order_num: 1,
    name: { uz: '', ru: '', en: '' },
    type: 'lesson'
  });

  useEffect(() => {
    if (subjectId && courseId && moduleId) {
      loadData();
    }
  }, [subjectId, courseId, moduleId]);

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
      const lessonsResponse = await lessonService.getAll(moduleId);
      setLessons(lessonsResponse.data);
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
      type: 'lesson'
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
      type: (lesson.type as any) || 'lesson'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to delete this lesson?`)) {
      return;
    }

    try {
      await lessonService.delete(lesson.id);
      loadLessons();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = { ...formData, is_free: false, type: formData.type as 'lesson' | 'test' }; // Ensure is_free is sent
      if (editingLesson) {
        await lessonService.update(editingLesson.id, payload);
      } else {
        await lessonService.create(payload);
      }
      setIsModalOpen(false);
      loadLessons();
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Failed to save lesson: ' + (error as any)?.response?.data?.message || 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subject || !course || !module) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Subjects', href: '/admin/subjects' },
    { label: subject?.name?.en || subject?.name?.uz || subject?.name?.ru || 'Unnamed Subject', href: `/admin/subjects/${subjectId}` },
    { label: course?.name?.en || course?.name?.uz || course?.name?.ru || 'Untitled Course', href: `/admin/subjects/${subjectId}/courses/${courseId}` },
    { label: module?.name?.en || module?.name?.uz || module?.name?.ru || 'Untitled Module' },
  ];

  const lessonTypeOptions = [
    { value: 'lesson', label: 'Lesson' },
    { value: 'test', label: 'Test' }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {module?.name?.en || module?.name?.uz || module?.name?.ru || 'Untitled Module'}
          </h1>
          <p className="text-muted-foreground mt-1">Manage lessons in this module</p>
        </div>
        <Button onClick={handleCreate}>Add Lesson</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
          <CardDescription>
            {lessonsLoading ? 'Loading lessons...' :
              lessons.length === 0
                ? 'No lessons in this module yet'
                : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''} in this module`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessonsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No lessons available</p>
              <Button onClick={handleCreate}>Create your first lesson</Button>
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
                              {lesson.name?.en || lesson.name?.uz || lesson.name?.ru || 'Untitled Lesson'}
                            </h3>
                          </Link>
                          <span className="text-sm text-muted-foreground">{lesson.duration || 0} min</span>
                          <Badge variant="outline">{lesson.type || 'lesson'}</Badge>
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
          <MultilangInput
            label="Name"
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
            required
          />
          <Select
            label="Type"
            options={lessonTypeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
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

