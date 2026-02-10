
import api from '@/lib/api/axios';
import {
    Course,
    CourseCreateBody,
    CourseUpdateBody,
    CoursePermission,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'course';

export const courseService = {
    // Course CRUD
    getAll: async (subjectId?: string, page = 1, limit = 10, filters?: { name?: string; teacher_id?: string; is_public?: boolean }): Promise<PaginatedResponse<Course>> => {
        const params: any = { page, limit, ...filters };
        if (subjectId) params.subject_id = subjectId;

        const response = await api.get<PaginatedResponse<Course>>(RESOURCE_URL, {
            params
        });
        return response.data;
    },

    getById: async (id: string): Promise<Course> => {
        const response = await api.get<Course>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: CourseCreateBody): Promise<Course> => {
        const response = await api.post<Course>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: CourseUpdateBody): Promise<Course> => {
        const response = await api.put<Course>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    },

    // Permissions (User-Course)
    getPermissions: async (page = 1, limit = 10, filters?: { user_id?: string; course_id?: string; tariff_id?: string }): Promise<PaginatedResponse<CoursePermission>> => {
        const response = await api.get<PaginatedResponse<CoursePermission>>(`${RESOURCE_URL}/permission`, {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    grantPermission: async (data: CoursePermissionCreateBody): Promise<CoursePermission> => {
        const response = await api.post<CoursePermission>(`${RESOURCE_URL}/permission`, data);
        return response.data;
    },

    getPermissionById: async (id: string): Promise<CoursePermission> => {
        const response = await api.get<CoursePermission>(`${RESOURCE_URL}/permission/${id}`);
        return response.data;
    },

    updatePermission: async (id: string, data: Partial<CoursePermission>): Promise<CoursePermission> => {
        const response = await api.put<CoursePermission>(`${RESOURCE_URL}/permission/${id}/update`, data);
        return response.data;
    },

    deletePermission: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/permission/${id}/delete`);
    }
};
