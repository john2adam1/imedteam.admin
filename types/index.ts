// TypeScript interfaces matching backend API contract

// Multilanguage text object
export interface MultilangText {
  uz: string;
  ru: string;
  en: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Common Fields
type ID = string;
type DateString = string; // ISO 8601

// ─── AUTHENTICATION ─────────────────────
export interface LoginReq {
  login: string;
  password: string;
}

export interface TokenRes {
  access_token: string;
  refresh_token: string;
  id: string;
  role: string;
}

export interface AuthResponse extends TokenRes {
  // Keeping interface consistent with TokenRes
}

export interface PasswordChangeReq {
  old_password?: string;
  new_password?: string;
}

// ─── ABOUT ──────────────────────────────
export interface About {
  id: ID;
  title: MultilangText;
  description: MultilangText;
  order_num: number;
  link_url?: string;
  created_at: DateString;
  updated_at: DateString;
}

export type AboutCreateBody = Omit<About, 'id' | 'created_at' | 'updated_at'>;
export type AboutUpdateBody = Partial<AboutCreateBody>;

// ─── CONTACT ────────────────────────────
export interface Contact {
  id: ID;
  name: string;
  phone_number: string;
  link_url?: string;
  created_at: DateString;
  updated_at: DateString;
}

export interface ContactCreateBody {
  name: string;
  phone_number: string;
  link_url?: string;
}
export type ContactUpdateBody = Partial<ContactCreateBody>;

// ─── FAQ ────────────────────────────────
export interface FAQ {
  id: ID;
  question: MultilangText;
  answer: MultilangText;
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export type FAQCreateBody = Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;
export type FAQUpdateBody = Partial<FAQCreateBody>;

// ─── BANNER ─────────────────────────────
export interface Banner {
  id: ID;
  title: MultilangText;
  description: MultilangText;
  image_url: MultilangText; // Image URL is now multilingual
  link_url?: string;
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export type BannerCreateBody = Omit<Banner, 'id' | 'created_at' | 'updated_at'>;
export type BannerUpdateBody = Partial<BannerCreateBody>;

// ─── SUBJECT ─────────────────────────────
export interface Subject {
  id: ID;
  name: MultilangText;
  image_url: string; // Icon or image
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export type SubjectCreateBody = Omit<Subject, 'id' | 'created_at' | 'updated_at'>;
export type SubjectUpdateBody = Partial<SubjectCreateBody>;

// ─── TEACHER ─────────────────────────────
export interface Teacher {
  id: ID;
  name: string;
  login: string;
  phone_number: string;
  created_at: DateString;
  updated_at: DateString;
}

export interface TeacherCreateBody extends Omit<Teacher, 'id' | 'created_at' | 'updated_at'> {
  password: string;
}
export type TeacherUpdateBody = Partial<TeacherCreateBody>;

// ─── SOURCE ──────────────────────────────
export interface Source {
  id: ID;
  lesson_id: ID;
  name: MultilangText;
  url: MultilangText; // Multilingual URL
  type: 'video' | 'document' | 'test'; // Strict enums
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export type SourceCreateBody = Omit<Source, 'id' | 'created_at' | 'updated_at'>;
export type SourceUpdateBody = Partial<SourceCreateBody>;

// ─── COURSE ──────────────────────────────
export interface CoursePriceOption {
  duration: number;
  price: number;
}

export interface Course {
  id: ID;
  name: MultilangText;
  description: MultilangText;
  price: CoursePriceOption[];
  old_price?: number;
  image_url: string;
  subject_id: ID; // Link to Subject
  teacher_id?: ID; // Link to Teacher
  order_num: number;
  is_public: boolean;
  created_at: DateString;
  updated_at: DateString;
}

export type CourseCreateBody = Omit<Course, 'id' | 'created_at' | 'updated_at'>;
export type CourseUpdateBody = Partial<CourseCreateBody>;

// User-Course Relationship (updated to match Swagger)
export interface CoursePermission {
  id: ID;
  user_id: ID;
  course_id: ID;
  tariff_id: ID; // Links to Tariff
  started_at: DateString;
  ended_at: DateString;
  is_active: boolean;
  duration: number; // in days
  created_at: DateString;
  updated_at: DateString;
}

export interface CoursePermissionCreateBody {
  user_id: ID;
  course_id: ID;
  tariff_id: ID;
}

// ─── MODULE ──────────────────────────────
export interface Module {
  id: ID;
  course_id: ID;
  name: MultilangText;
  description?: MultilangText;
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export type ModuleCreateBody = Omit<Module, 'id' | 'created_at' | 'updated_at'>;
export type ModuleUpdateBody = Partial<ModuleCreateBody>;

// ─── LESSON ──────────────────────────────
export interface Lesson {
  id: ID;
  module_id: ID;
  name: MultilangText;
  type: 'lesson' | 'test';
  duration?: number; // seconds
  order_num: number;
  is_free: boolean; // Preview allowed?
  is_public: boolean; // Public visibility
  created_at: DateString;
  updated_at: DateString;
}

export type LessonCreateBody = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
export type LessonUpdateBody = Partial<LessonCreateBody>;

// ─── USER (ADMIN VIEW) ───────────────────
export interface User {
  id: ID;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'user' | 'admin' | 'moderator';
  is_blocked: boolean;
  created_at: DateString;
  updated_at: DateString;
}

export interface UserProfile extends User {
  // Extra profile fields
  birth_date?: string;
  gender?: 'male' | 'female';
  address?: string;
}

export interface UserActivity {
  id: ID;
  user_id: ID;
  action: string;
  metadata?: any;
  created_at: DateString;
}

// ─── NOTIFICATION ────────────────────────
// FIXED: Changed type from 'all' | 'selected' to 'all' | 'course'
// The database constraint expects 'course', not 'selected'
export interface Notification {
  id: ID;
  course_id?: ID;
  title: MultilangText;
  message: MultilangText;
  type: 'all' | 'course';  // Changed from 'selected' to 'course'
  is_sent: boolean;
  sent_at?: DateString;
  created_at: DateString;
}

export type NotificationCreateBody = Omit<Notification, 'id' | 'created_at' | 'is_sent' | 'sent_at'>;
export type NotificationUpdateBody = Partial<NotificationCreateBody>;

// ─── FILE UPDATE ─────────────────────────
export interface FileUploadRes {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

// ─── APP ROUTE ───────────────────────────
export interface AppRoute {
  id: ID;
  key: string;
  value: any; // JSON object for dynamic routing config
  description?: string;
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export interface AppRouteCreateBody {
  key: string;
  value: any;
  description?: string;
  order_num?: number;
}

export type AppRouteUpdateBody = Partial<AppRouteCreateBody>;

// ─── TARIFF ──────────────────────────────
export interface Tariff {
  id: ID;
  name: string; // Backend expects string, not MultilangText
  description: string; // Backend expects string, not MultilangText
  duration: number; // in days
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export interface TariffCreateBody {
  name: string;
  description: string;
  duration: number;
  order_num?: number;
}

export type TariffUpdateBody = Partial<TariffCreateBody>;