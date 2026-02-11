
import api from '@/lib/api/axios';
import { PaginationMeta } from '@/types';

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

export interface OrderListResponse {
    orders: Order[];
    count: number;
    meta?: PaginationMeta;
}

export const orderService = {
    getAll: async (page = 1, limit = 10, filters?: { status?: string; user_id?: string; course_id?: string; promocode?: string; type?: string; from?: string; to?: string; payment_type?: string }): Promise<OrderListResponse> => {
        // Assuming /web/order supports pagination/filtering
        const response = await api.get<OrderListResponse>('order', {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    getOne: async (id: string): Promise<Order> => {
        const response = await api.get<any>(`order/${id}`);
        // Response is { order: { ... } }
        return response.data.order || response.data;
    }
};
