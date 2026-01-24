
import api from '@/lib/api/axios';
import axios from 'axios';
import {
    Notification,
    NotificationCreateBody,
    NotificationUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = '/notifications';

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
        console.log('Creating notification with payload:', JSON.stringify(data, null, 2));
        console.log('Request URL:', api.defaults.baseURL + RESOURCE_URL);
        try {
            const response = await api.post<Notification>(RESOURCE_URL, data);
            console.log('Notification created successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating notification:', error);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            throw error;
        }
    },

    update: async (id: string, data: NotificationUpdateBody): Promise<Notification> => {
        console.log('Updating notification with payload:', JSON.stringify(data, null, 2));
        console.log('Request URL:', api.defaults.baseURL + `${RESOURCE_URL}/${id}/update`);
        try {
            const response = await api.put<Notification>(`${RESOURCE_URL}/${id}/update`, data);
            console.log('Notification updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error updating notification:', error);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            throw error;
        }
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
