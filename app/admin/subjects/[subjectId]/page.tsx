'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Subject, Course, Teacher } from '@/types';
import { subjectService } from '@/services/subject.service';
import { courseService } from '@/services/course.service';
import { teacherService } from '@/services/teacher.service';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MultilangInput } from '@/components/ui/MultilangInput';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    subject_id: subjectId,
    teacher_id: '',
    image_url: '',
    is_active: true,
    order_num: 1,
    price: { uz: '', ru: '', en: '' },
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
  });

  useEffect(() => {
    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  const loadData = async () => {
    try {
      const [subjectData, coursesResponse, teachersResponse] = await Promise.all([
        subjectService.getById(subjectId),
        courseService.getAll(subjectId), // Using filter
        teacherService.getAll(),
      ]);

      if (!subjectData) {
        router.push('/admin/subjects');
        return;
      }

      setSubject(subjectData);
      setCourses(coursesResponse.data);
      setTeachers(teachersResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      subject_id: subjectId,
      teacher_id: teachers[0]?.id || '',
      image_url: '',
      is_active: true,
      order_num: courses.length + 1,
      price: { uz: '', ru: '', en: '' },
      title: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      subject_id: course.subject_id,
      teacher_id: course.teacher_id || '',
      image_url: course.image_url,
      is_active: course.is_active,
      order_num: course.order_num,
      price: typeof course.price === 'object' ? course.price : { uz: '', ru: '', en: '' },
      title: course.title,
      description: course.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete this course?`)) {
      return;
    }

    try {
      await courseService.delete(course.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, formData);
      } else {
        await courseService.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Subjects', href: '/admin/subjects' },
    { label: subject.name.en || subject.name.uz || subject.name.ru },
  ];

  const teacherOptions = teachers.map((t) => ({
    value: t.id,
    label: `${t.first_name} ${t.last_name}`,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {subject.name.en || subject.name.uz || subject.name.ru}
          </h1>
          <p className="text-muted-foreground mt-1">Manage courses in this subject</p>
        </div>
        <Button onClick={handleCreate}>Add Course</Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>
            {courses.length === 0
              ? 'No courses in this subject yet'
              : `${courses.length} course${courses.length !== 1 ? 's' : ''} in this subject`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No courses available</p>
              <Button onClick={handleCreate}>Create your first course</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses
                .sort((a, b) => a.order_num - b.order_num)
                .map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link href={`/admin/subjects/${subjectId}/courses/${course.id}`}>
                            <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2">
                              {course.title.en || course.title.uz || course.title.ru}
                            </CardTitle>
                          </Link>
                          <CardDescription className="mt-2 line-clamp-2">
                            {course.description.en || course.description.uz || course.description.ru}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant={course.is_active ? 'success' : 'secondary'}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(course)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(course)}
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
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultilangInput
            label="Name"
            value={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            required
          />
          <MultilangInput
            label="Description"
            value={formData.description}
            onChange={(description) => setFormData({ ...formData, description })}
            required
          />
          <MultilangInput
            label="Price"
            value={formData.price}
            onChange={(price) => setFormData({ ...formData, price })}
            placeholder={{ uz: 'Narx', ru: 'Цена', en: 'Price' }}
            required
          />
          <Select
            label="Teacher"
            options={teacherOptions}
            value={formData.teacher_id}
            onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
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
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium">Active Status</label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
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

