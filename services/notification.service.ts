
import api from '@/lib/api/axios';
import {
    Notification,
    NotificationCreateBody,
    NotificationUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'notification';

export const notificationService = {
    // Admin Notifications
    getAll: async (page = 1, limit = 10, filters?: { title?: string; course_id?: string }): Promise<PaginatedResponse<Notification>> => {
        const params: any = { page, limit };
        if (filters?.title) params.title = filters.title;
        if (filters?.course_id) params.course_id = filters.course_id;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.notifications || raw.items || [];

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

    getById: async (id: string): Promise<Notification> => {
        const response = await api.get<Notification>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: NotificationCreateBody): Promise<Notification> => {
        const response = await api.post<Notification>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: NotificationUpdateBody): Promise<Notification> => {
        const response = await api.put<Notification>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    },

    // User Notifications (if admin needs to see them or manage them separately, otherwise covered above)
    getUserNotifications: async (page = 1, limit = 10, filters?: { type?: string }): Promise<PaginatedResponse<Notification>> => {
        const params: any = { page, limit };
        if (filters?.type) params.type = filters.type;

        const response = await api.get<any>(`${RESOURCE_URL}/user`, { params });
        const raw = response.data;
        const data = raw.data || raw.notifications || raw.items || [];

        return {
            data,
            total: raw.total || raw.count || data.length,
            page: raw.page || page,
            limit: raw.limit || limit,
            total_page: raw.total_page || Math.ceil((raw.total || data.length) / limit),
            has_next: raw.has_next ?? false,
            has_previous: raw.has_previous ?? false,
        };
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.put(`${RESOURCE_URL}/${id}/read`);
    }
};
