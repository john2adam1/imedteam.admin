
import api from '@/lib/api/axios';

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
    orders: Order[]; // Adjust if actual response key is different, usually it matches model name plural
    count: number;
}

export const orderService = {
    getAll: async (page = 1, limit = 10, filters?: { status?: string; user_id?: string; course_id?: string; promocode?: string }): Promise<OrderListResponse> => {
        // Assuming /web/order supports pagination/filtering
        const response = await api.get<OrderListResponse>('order', {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    getOne: async (id: string): Promise<Order> => {
        const response = await api.get<Order>(`order/${id}`);
        return response.data;
    }
};
