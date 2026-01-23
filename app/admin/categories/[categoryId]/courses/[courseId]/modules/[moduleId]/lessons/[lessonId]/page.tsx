'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Category, Course, Module, Lesson } from '@/types';
import { categoriesApi, coursesApi, modulesApi, lessonsApi } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    pdfResource: '',
    testPdf: '',
    isFree: true,
  });

  useEffect(() => {
    if (categoryId && courseId && moduleId && lessonId) {
      loadData();
    }
  }, [categoryId, courseId, moduleId, lessonId]);

  const loadData = async () => {
    try {
      const [categoryData, courseData, moduleData, lessonData] = await Promise.all([
        categoriesApi.getById(categoryId),
        coursesApi.getById(courseId),
        modulesApi.getById(moduleId),
        lessonsApi.getById(lessonId),
      ]);

      if (!categoryData || !courseData || !moduleData || !lessonData) {
        router.push('/admin/categories');
        return;
      }

      setCategory(categoryData);
      setCourse(courseData);
      setModule(moduleData);
      setLesson(lessonData);
      setFormData({
        title: lessonData.title,
        videoUrl: lessonData.videoUrl,
        pdfResource: lessonData.pdfResource,
        testPdf: lessonData.testPdf,
        isFree: lessonData.isFree,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lesson) return;

    try {
      await lessonsApi.update(lesson.id, formData);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Failed to save lesson');
    }
  };

  // Helper to check if URL is a video embed (YouTube, Vimeo, etc.)
  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // If it's already an embed URL or direct video URL, return as is
    if (url.includes('embed') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) {
      return url;
    }
    
    return null;
  };

  const videoEmbedUrl = lesson ? getVideoEmbedUrl(lesson.videoUrl) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!category || !course || !module || !lesson) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Categories', href: '/admin/categories' },
    { label: category.name, href: `/admin/categories/${categoryId}` },
    { label: course.title, href: `/admin/categories/${categoryId}/courses/${courseId}` },
    { label: module.title, href: `/admin/categories/${categoryId}/courses/${courseId}/modules/${moduleId}` },
    { label: lesson.title },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={lesson.isFree ? 'success' : 'secondary'}>
              {lesson.isFree ? 'Free' : 'Paid'}
            </Badge>
          </div>
        </div>
        <Button onClick={handleEdit}>Edit Lesson</Button>
      </div>

      <Separator />

      {/* Video Section */}
      <Card>
        <CardHeader>
          <CardTitle>Video</CardTitle>
          <CardDescription>Lesson video content</CardDescription>
        </CardHeader>
        <CardContent>
          {videoEmbedUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src={videoEmbedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : lesson.videoUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <video controls className="w-full h-full">
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="aspect-video w-full rounded-lg border border-dashed flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">No video URL provided</p>
            </div>
          )}
          {lesson.videoUrl && (
            <p className="mt-3 text-sm">
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open video URL →
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      {/* PDF Resource Section */}
      {lesson.pdfResource && (
        <Card>
          <CardHeader>
            <CardTitle>PDF Resource</CardTitle>
            <CardDescription>Supplementary PDF material (view only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={lesson.pdfResource}
                className="w-full h-96"
                title="PDF Resource"
              />
            </div>
            <p className="mt-3 text-sm">
              <a
                href={lesson.pdfResource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View PDF Resource →
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Test PDF Section */}
      {lesson.testPdf && (
        <Card>
          <CardHeader>
            <CardTitle>Test PDF</CardTitle>
            <CardDescription>Test and assessment PDF (view only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={lesson.testPdf}
                className="w-full h-96"
                title="Test PDF"
              />
            </div>
            <p className="mt-3 text-sm">
              <a
                href={lesson.testPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Test PDF →
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Lesson"
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
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium">Free Lesson</label>
            <Switch
              checked={formData.isFree}
              onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
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
