
import api from '@/lib/api/axios';
import { PaginationMeta, PaginatedResponse } from '@/types';

export interface Order {
    id: string;
    user_id: string;
    user_name: string;
    user_phone: string;
    course_id: string;
    course_name: string;
    tariff_id: string;
    tariff_name: string;
    amount: number;
    discount_amount: number;
    promocode: string;
    promocode_id: string;
    status: string; // 'pending', 'paid', 'cancelled' etc.
    payment_type: string;
    created_at: string;
    paid_at: string;
    duration: number; // Duration in months/days maybe?
}

export interface OrderListResponse extends PaginatedResponse<Order> { }

export const orderService = {
    getAll: async (page = 1, limit = 10, filters?: { status?: string; user_id?: string; course_id?: string; promocode_id?: string; type?: string; from?: string; to?: string; payment_type?: string }): Promise<PaginatedResponse<Order>> => {
        const params = Object.fromEntries(
            Object.entries({ page, limit, ...filters }).filter(([, value]) => value !== '' && value !== undefined && value !== null)
        );

        const response = await api.get<any>('order', {
            params
        });

        const raw = response.data;
        // The backend might return { orders: [], count: 10 } or { data: [], total: 10 }
        const data = raw.data || raw.orders || raw.items || [];
        const total = raw.total || raw.count || raw.meta?.total_items || data.length;

        return {
            data,
            total,
            page: raw.page || page,
            limit: raw.limit || limit,
            total_page: raw.total_page || raw.total_pages || raw.meta?.total_pages || Math.ceil(total / limit),
            has_next: raw.has_next ?? (page * limit < total),
            has_previous: raw.has_previous ?? (page > 1),
        };
    },

    getOne: async (id: string): Promise<Order> => {
        const response = await api.get<any>(`order/${id}`);
        // Response is { order: { ... } }
        return response.data.order || response.data;
    }
};
