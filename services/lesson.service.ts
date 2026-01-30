
import api from '@/lib/api/axios';
import {
    Lesson,
    LessonCreateBody,
    LessonUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'lesson';

export const lessonService = {
    getAll: async (moduleId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Lesson>> => {
        const params: any = { page, limit };
        if (moduleId) params.module_id = moduleId;

        const response = await api.get<PaginatedResponse<Lesson>>(RESOURCE_URL, { params });
        return response.data;
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
