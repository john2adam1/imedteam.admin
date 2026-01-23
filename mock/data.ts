// Mock data for development - Replace with real API calls later
// TODO: Replace with actual API calls in services/api.ts

import { Subject, Course, Module, Lesson, Source, Teacher, Banner } from '@/types';

export const mockSubjects: Subject[] = [
  {
    id: '1',
    image_url: '/images/programming.jpg',
    order_num: 1,
    name: { uz: 'Dasturlash', ru: 'Программирование', en: 'Programming' },
  },
  {
    id: '2',
    image_url: '/images/design.jpg',
    order_num: 2,
    name: { uz: 'Dizayn', ru: 'Дизайн', en: 'Design' },
  },
  {
    id: '3',
    image_url: '/images/business.jpg',
    order_num: 3,
    name: { uz: 'Biznes', ru: 'Бизнес', en: 'Business' },
  },
];

export const mockTeachers: Teacher[] = [
  { id: '1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', phone: '+0987654321', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', phone: '+1122334455', email: 'bob@example.com' },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    subject_id: '1',
    teacher_id: '1',
    image_url: '/images/react-course.jpg',
    is_public: true,
    order_num: 1,
    price: { uz: '0', ru: '0', en: '0' },
    name: { uz: 'React asoslari', ru: 'Основы React', en: 'Introduction to React' },
    description: {
      uz: 'React-dan boshlang\'ich darajada o\'rganing',
      ru: 'Изучите React с нуля',
      en: 'Learn React from scratch',
    },
  },
  {
    id: '2',
    subject_id: '1',
    teacher_id: '2',
    image_url: '/images/typescript-course.jpg',
    is_public: false,
    order_num: 2,
    price: { uz: '500000', ru: '500000', en: '50' },
    name: { uz: 'TypeScript ilg\'or', ru: 'Продвинутый TypeScript', en: 'Advanced TypeScript' },
    description: {
      uz: 'TypeScript-ni ishlab chiqarish uchun o\'zlashtiring',
      ru: 'Освойте TypeScript для производства',
      en: 'Master TypeScript for production',
    },
  },
];

export const mockModules: Module[] = [
  {
    id: '1',
    course_id: '1',
    order_num: 1,
    name: { uz: 'Boshlash', ru: 'Начало', en: 'Getting Started' },
  },
  {
    id: '2',
    course_id: '1',
    order_num: 2,
    name: { uz: 'Komponentlar', ru: 'Компоненты', en: 'Components' },
  },
  {
    id: '3',
    course_id: '2',
    order_num: 1,
    name: { uz: 'Tip tizimi', ru: 'Система типов', en: 'Type System' },
  },
];

export const mockLessons: Lesson[] = [
  {
    id: '1',
    module_id: '1',
    duration: 30,
    order_num: 1,
    type: 'video',
    name: { uz: 'React nima?', ru: 'Что такое React?', en: 'What is React?' },
  },
  {
    id: '2',
    module_id: '1',
    duration: 45,
    order_num: 2,
    type: 'mixed',
    name: { uz: 'Muhitni sozlash', ru: 'Настройка окружения', en: 'Setting up Environment' },
  },
];

export const mockSources: Source[] = [
  {
    id: '1',
    lesson_id: '1',
    order_num: 1,
    type: 'video',
    name: { uz: 'Video dars', ru: 'Видео урок', en: 'Video Lesson' },
    url: {
      uz: 'https://example.com/video1.mp4',
      ru: 'https://example.com/video1.mp4',
      en: 'https://example.com/video1.mp4',
    },
  },
  {
    id: '2',
    lesson_id: '2',
    order_num: 1,
    type: 'video',
    name: { uz: 'Video dars', ru: 'Видео урок', en: 'Video Lesson' },
    url: {
      uz: 'https://example.com/video2.mp4',
      ru: 'https://example.com/video2.mp4',
      en: 'https://example.com/video2.mp4',
    },
  },
  {
    id: '3',
    lesson_id: '2',
    order_num: 2,
    type: 'pdf',
    name: { uz: 'PDF resurs', ru: 'PDF ресурс', en: 'PDF Resource' },
    url: {
      uz: 'https://example.com/resource2.pdf',
      ru: 'https://example.com/resource2.pdf',
      en: 'https://example.com/resource2.pdf',
    },
  },
];

export const mockBanners: Banner[] = [
  {
    id: '1',
    image_url: {
      uz: '/images/banner1.jpg',
      ru: '/images/banner1.jpg',
      en: '/images/banner1.jpg',
    },
    title: { uz: 'Yangi kurs', ru: 'Новый курс', en: 'New Course' },
    description: {
      uz: 'Yangi React kursini tekshiring!',
      ru: 'Проверьте наш новый курс React!',
      en: 'Check out our new React course!',
    },
    link_url: '/courses/1',
    order_num: 1,
  },
];
