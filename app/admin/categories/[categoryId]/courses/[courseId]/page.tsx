'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, Course, Module } from '@/types';
import { categoriesApi, coursesApi, modulesApi } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const courseId = params.courseId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    courseId: courseId,
    title: '',
    order: 1,
  });

  useEffect(() => {
    if (categoryId && courseId) {
      loadData();
    }
  }, [categoryId, courseId]);

  const loadData = async () => {
    try {
      const [categoryData, courseData, modulesData] = await Promise.all([
        categoriesApi.getById(categoryId),
        coursesApi.getById(courseId),
        modulesApi.getAll(courseId),
      ]);

      if (!categoryData || !courseData) {
        router.push('/admin/categories');
        return;
      }

      setCategory(categoryData);
      setCourse(courseData);
      setModules(modulesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModule(null);
    setFormData({
      courseId: courseId,
      title: '',
      order: modules.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      courseId: module.courseId,
      title: module.title,
      order: module.order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (module: Module) => {
    if (!confirm(`Are you sure you want to delete "${module.title}"?`)) {
      return;
    }

    try {
      await modulesApi.delete(module.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete module:', error);
      alert('Failed to delete module');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingModule) {
        await modulesApi.update(editingModule.id, formData);
      } else {
        await modulesApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save module:', error);
      alert('Failed to save module');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!category || !course) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Categories', href: '/admin/categories' },
    { label: category.name, href: `/admin/categories/${categoryId}` },
    { label: course.title },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground mt-1">{course.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={course.isPublic ? 'success' : 'secondary'}>
              {course.isPublic ? 'Public' : 'Paid'}
            </Badge>
          </div>
        </div>
        <Button onClick={handleCreate}>Add Module</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <CardDescription>
            {modules.length === 0
              ? 'No modules in this course yet'
              : `${modules.length} module${modules.length !== 1 ? 's' : ''} in this course`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No modules available</p>
              <Button onClick={handleCreate}>Create your first module</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {modules
                .sort((a, b) => a.order - b.order)
                .map((module) => (
                  <Card key={module.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                            {module.order}
                          </div>
                          <Link
                            href={`/admin/categories/${categoryId}/courses/${courseId}/modules/${module.id}`}
                            className="flex-1"
                          >
                            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                              {module.title}
                            </h3>
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(module)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(module)}
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
        title={editingModule ? 'Edit Module' : 'Add Module'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
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
