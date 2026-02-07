
import api from '@/lib/api/axios';

export interface PromoCode {
    id: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    starts_at: string;
    ends_at: string;
    max_uses_total: number;
    max_uses_per_user: number;
    min_order_amount: number;
    max_discount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PromoCodeCreateReq {
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    starts_at: string;
    ends_at: string;
    max_uses_total?: number;
    max_uses_per_user?: number;
    min_order_amount?: number;
    max_discount?: number;
    is_active?: boolean;
}

export interface PromoCodeUpdateReq {
    discount_type?: 'percent' | 'fixed';
    discount_value?: number;
    starts_at?: string;
    ends_at?: string;
    max_uses_total?: number;
    max_uses_per_user?: number;
    min_order_amount?: number;
    max_discount?: number;
    is_active?: boolean;
}

export interface PromoCodeListResponse {
    promo_codes: PromoCode[];
    count: number;
}

export const promocodeService = {
    getAll: async (page = 1, limit = 10): Promise<PromoCodeListResponse> => { // Backend might not support pagination for this list based on swagger inspection, but adding params just in case or ignored if not supported
        const response = await api.get<PromoCodeListResponse>('promocode');
        return response.data;
    },

    getOne: async (id: string): Promise<PromoCode> => {
        const response = await api.get<PromoCode>(`promocode/${id}`);
        return response.data;
    },

    create: async (data: PromoCodeCreateReq): Promise<PromoCode> => {
        const response = await api.post<PromoCode>('promocode', data);
        return response.data;
    },

    update: async (id: string, data: PromoCodeUpdateReq): Promise<PromoCode> => {
        const response = await api.put<PromoCode>(`promocode/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`promocode/${id}`);
    }
};
