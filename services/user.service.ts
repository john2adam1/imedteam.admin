
import api from '@/lib/api/axios';
import {
    User,
    UserProfile,
    UserActivity,
    PaginatedResponse,
    RatingResponse,
    RatingItem
} from '@/types';

export const userService = {
    // ADMIN Management
    getAll: async (page = 1, limit = 10, filters?: { name?: string; phone_number?: string; email?: string; role?: string; is_blocked?: boolean }): Promise<PaginatedResponse<User>> => {
        const params: any = { page, limit };
        if (filters?.name) params.name = filters.name;
        if (filters?.phone_number) params.phone_number = filters.phone_number;
        if (filters?.email) params.email = filters.email;
        if (filters?.role) params.role = filters.role;
        if (filters?.is_blocked !== undefined) params.is_blocked = String(filters.is_blocked);

        const response = await api.get<any>('user', { params });
        const raw = response.data;
        const data = raw.data || raw.users || raw.items || [];

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

    getById: async (id: string): Promise<User> => {
        const response = await api.get<User>(`user/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`user/${id}/delete`);
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
        const response = await api.get<any>('user/activity', {
            params: { page, limit }
        });
        const raw = response.data;
        const data = raw.data || raw.items || [];

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

    logActivity: async (data: any): Promise<void> => {
        await api.post('user/activity', data);
    },

    getRating: async (type: 'day' | 'week' | 'month' | 'year' | 'total' = 'total', limit = 10): Promise<RatingResponse> => {
        const response = await api.get<RatingResponse>('user/rating', {
            params: { type, limit }
        });
        return response.data;
    }
};
