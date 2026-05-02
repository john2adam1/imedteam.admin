
import api from '@/lib/api/axios';
import { PromocodeRedemptionListResponse, PaginationMeta } from '@/types';

export interface PromoCode {
    id: string;
    code: string;
    type: 'all' | 'selected';
    courses: string[];
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
    type: 'all' | 'selected';
    courses: string[];
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    starts_at?: string;
    ends_at?: string;
    max_uses_total?: number;
    max_uses_per_user?: number;
    min_order_amount?: number;
    max_discount?: number;
    // NOTE: is_active is NOT sent on create — backend does not accept it on POST
}

export interface PromoCodeUpdateReq {
    type?: 'all' | 'selected';
    courses?: string[];
    discount_type?: 'percent' | 'fixed';
    discount_value?: number;
    starts_at?: string;
    ends_at?: string;
    max_uses_total?: number;
    max_uses_per_user?: number;
    min_order_amount?: number;
    max_discount?: number;
    is_active?: boolean; // Only PUT /update accepts is_active
}

export interface PromoCodeListResponse {
    promo_codes?: PromoCode[];
    promocodes?: PromoCode[];
    count: number;
    meta?: PaginationMeta;
}

export const promocodeService = {
    getAll: async (page = 1, limit = 10, filters?: { code?: string; is_active?: boolean }): Promise<PromoCodeListResponse> => {
        const response = await api.get<PromoCodeListResponse>('promocode', {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    getOne: async (id: string): Promise<PromoCode> => {
        const response = await api.get<PromoCode>(`promocode/${id}`);
        return response.data;
    },

    create: async (data: PromoCodeCreateReq): Promise<PromoCode> => {
        // Backend faqat 'percent' yoki 'fixed' qabul qiladi
        const normalizedDiscountType =
            data.discount_type === 'fixed' || data.discount_type === 'percent'
                ? data.discount_type
                : undefined;

        if (!normalizedDiscountType) {
            throw new Error("Discount turi noto'g'ri: 'fixed' yoki 'percent' bo'lishi kerak");
        }

        const payload: Record<string, unknown> = {
            code: data.code,
            type: data.type,
            // type === 'all' bo'lsa courses bo'sh array, 'selected' bo'lsa haqiqiy ID lar
            courses: data.type === 'selected' ? data.courses : [],
            discount_type: normalizedDiscountType,
            discount_value: data.discount_value,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            max_uses_total: data.max_uses_total,
            max_uses_per_user: data.max_uses_per_user,
            min_order_amount: data.min_order_amount,
            max_discount: data.max_discount,
            // is_active INTENTIONALLY omitted — backend does not accept it on CREATE
        };

        // undefined, null, '' qiymatlarni olib tashlash
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
                delete payload[key];
            }
        });

        console.log('SENDING PAYLOAD TO BACKEND:', JSON.stringify(payload, null, 2));
        try {
            const response = await api.post<PromoCode>('promocode', payload);
            return response.data;
        } catch (error: any) {
            console.log('FULL ERROR RESPONSE:', error.response?.data);
            console.log('ERROR STATUS:', error.response?.status);
            console.log('ERROR HEADERS:', error.response?.headers);
            throw error;
        }
    },

    update: async (id: string, data: PromoCodeUpdateReq): Promise<PromoCode> => {
        const response = await api.put<PromoCode>(`promocode/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`promocode/${id}/delete`);
    },

    getRedemptions: async (id: string, page = 1, limit = 10, filters?: any): Promise<PromocodeRedemptionListResponse> => {
        const response = await api.get<PromocodeRedemptionListResponse>(`promocode/redemption`, {
            params: { page, limit, promo_id: id, promocode_id: id, ...filters }
        });
        return response.data;
    },

    getAllRedemptions: async (page = 1, limit = 10, filters?: { user_id?: string; promo_id?: string; is_active?: string }): Promise<any> => {
        const response = await api.get<any>('promocode/redemption', {
            params: { page, limit, ...filters }
        });
        return response.data;
    }
};
