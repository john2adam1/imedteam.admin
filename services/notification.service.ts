
import api from '@/lib/api/axios';
import {
    Notification,
    NotificationCreateBody,
    NotificationUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = '/notification';

export const notificationService = {
    // Admin Notifications
    getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Notification>> => {
        const response = await api.get<PaginatedResponse<Notification>>(RESOURCE_URL, {
            params: { page, limit }
        });
        return response.data;
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
    getUserNotifications: async (page = 1, limit = 10): Promise<PaginatedResponse<Notification>> => {
        const response = await api.get<PaginatedResponse<Notification>>(`${RESOURCE_URL}/user`, {
            params: { page, limit }
        });
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.put(`${RESOURCE_URL}/${id}/read`);
    }
};
