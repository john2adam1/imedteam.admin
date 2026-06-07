
import api from '@/lib/api/axios';
import {
    Lesson,
    LessonCreateBody,
    LessonUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'lesson';

export const lessonService = {
    getAll: async (moduleId?: string, page = 1, limit = 10, filters?: { name?: string; type?: string; is_free?: boolean; is_public?: boolean }): Promise<PaginatedResponse<Lesson>> => {
        const params: any = { page, limit };
        if (moduleId) params.module_id = moduleId;
        if (filters?.name) params.name = filters.name;
        if (filters?.type) params.type = filters.type;
        if (filters?.is_free !== undefined) params.is_free = String(filters.is_free);
        if (filters?.is_public !== undefined) params.is_public = String(filters.is_public);

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.lessons || raw.items || [];

        return {
            data,
            total: raw.total || raw.count || (raw.meta?.total_items) || data.length,
            page: raw.page || page,
            limit: raw.limit || limit,
            total_page: raw.total_page || raw.total_pages || (raw.meta?.total_pages) || Math.ceil((raw.total || data.length) / limit),
            has_next: raw.has_next ?? false,
            has_previous: raw.has_previous ?? false,
        };
    },

    getById: async (id: string): Promise<Lesson> => {
        const response = await api.get<Lesson>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: LessonCreateBody): Promise<Lesson> => {
        const response = await api.post<Lesson>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: LessonUpdateBody): Promise<Lesson> => {
        const response = await api.put<Lesson>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    endLesson: async (id: string): Promise<void> => {
        await api.put(`${RESOURCE_URL}/${id}/end`);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
