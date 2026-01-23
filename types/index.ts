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
  phone: string;
  password?: string; // Admin login likely needs password
}

export interface TokenRes {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  token: string; // Keeping for backward compat if needed, but preferable to use TokenRes structure if API returns object
  // Based on "returns access_token and refresh_token", usually:
  access_token: string;
  refresh_token: string;
  user?: User; // Sometimes login returns user info
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
  phone: string;
  message: string;
  created_at: DateString;
  is_read?: boolean; // Common field, may need check
}

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
  image_url: string; // Assuming string URL, not MultilangText for image unless specified
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
  first_name: string;
  last_name: string;
  image_url?: string;
  bio?: MultilangText;
  profession?: MultilangText; // "Doctor", "Professor" etc.
  created_at: DateString;
  updated_at: DateString;
}

export type TeacherCreateBody = Omit<Teacher, 'id' | 'created_at' | 'updated_at'>;
export type TeacherUpdateBody = Partial<TeacherCreateBody>;

// ─── SOURCE ──────────────────────────────
export interface Source {
  id: ID;
  lesson_id: ID;
  title: MultilangText;
  link_url: string; // Video URL, PDF link etc.
  type: string; // 'video', 'pdf', 'article'
  order_num: number;
  created_at: DateString;
  updated_at: DateString;
}

export type SourceCreateBody = Omit<Source, 'id' | 'created_at' | 'updated_at'>;
export type SourceUpdateBody = Partial<SourceCreateBody>;

// ─── COURSE ──────────────────────────────
export interface Course {
  id: ID;
  title: MultilangText;
  description: MultilangText;
  price: MultilangText;
  old_price?: number;
  image_url: string;
  subject_id: ID; // Link to Subject
  teacher_id?: ID; // Link to Teacher
  order_num: number;
  is_active: boolean;
  created_at: DateString;
  updated_at: DateString;
}

export type CourseCreateBody = Omit<Course, 'id' | 'created_at' | 'updated_at'>;
export type CourseUpdateBody = Partial<CourseCreateBody>;

export interface CoursePermission {
  id: ID;
  user_id: ID;
  course_id: ID;
  status: 'active' | 'expired' | 'pending';
  start_date: DateString;
  end_date: DateString;
  created_at: DateString;
  updated_at: DateString;
}

// ─── MODULE ──────────────────────────────
export interface Module {
  id: ID;
  course_id: ID;
  title: MultilangText;
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
  title: MultilangText;
  content?: string; // HTML content or description
  video_url?: string;
  duration?: number; // seconds
  order_num: number;
  is_free: boolean; // Preview allowed?
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
  email?: string;
  purchasedCourses?: string[];
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
export interface Notification {
  id: ID;
  title: MultilangText;
  message: MultilangText;
  type: string;
  is_sent: boolean;
  sent_at?: DateString;
  created_at: DateString;
}

export type NotificationCreateBody = Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'is_sent' | 'sent_at'>;
export type NotificationUpdateBody = Partial<NotificationCreateBody>;

// ─── FILE UPDATE ─────────────────────────
export interface FileUploadRes {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

