
import api from '@/lib/api/axios';
import {
    User,
    UserProfile,
    UserActivity,
    PaginatedResponse
} from '@/types';

export const userService = {
    // ADMIN Management
    getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
        const response = await api.get<PaginatedResponse<User>>('user', {
            params: { page, limit }
        });
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get<User>(`user/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`user/${id}/delete`);
    },

    // Update user password (admin function)
    updatePassword: async (userId: string, newPassword: string): Promise<void> => {
        await api.put(`user/${userId}/password`, { new_password: newPassword });
    },

    // PROFILE & ACTIVITY
    getProfile: async (): Promise<UserProfile> => {
        const response = await api.get<UserProfile>('user/get/profile');
        return response.data;
    },

    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await api.put<UserProfile>('user/update/profile', data);
        return response.data;
    },

    deleteProfile: async (): Promise<void> => {
        await api.delete('user/delete/profile');
    },

    getActivity: async (page = 1, limit = 10): Promise<PaginatedResponse<UserActivity>> => {
        const response = await api.get<PaginatedResponse<UserActivity>>('user/activity', {
            params: { page, limit }
        });
        return response.data;
    },

    logActivity: async (data: any): Promise<void> => {
        await api.post('user/activity', data);
    },

    getRating: async (page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
        const response = await api.get<PaginatedResponse<any>>('user/rating', {
            params: { page, limit }
        });
        return response.data;
    }
};
