
import api from '@/lib/api/axios';
export type { PromoCode, PromoCodeCreateReq, PromoCodeUpdateReq, PromocodeRedemption, PromocodeRedemptionListResponse };
import { PaginatedResponse, PromoCode, PromoCodeCreateReq, PromoCodeUpdateReq, PromocodeRedemption, PromocodeRedemptionListResponse } from '@/types';

// Moved PromoCode interfaces to types if not there, or using local ones if needed
// For now, staying consistent with existing promocode.service.ts internal interfaces if needed
// But types/index.ts has PromocodeRedemption, let's check for PromoCode.

export const promocodeService = {
    getAll: async (page = 1, limit = 10, filters?: { code?: string; is_active?: boolean }): Promise<PaginatedResponse<PromoCode>> => {
        const params: any = { page, limit };
        if (filters?.code) params.code = filters.code;
        if (filters?.is_active !== undefined) params.is_active = String(filters.is_active);

        const response = await api.get<any>('promocode', { params });
        const raw = response.data;
        const data = raw.data || raw.promo_codes || raw.promocodes || raw.items || [];

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

    getOne: async (id: string): Promise<PromoCode> => {
        const response = await api.get<PromoCode>(`promocode/${id}`);
        return response.data;
    },

    create: async (data: PromoCodeCreateReq): Promise<PromoCode> => {
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
            courses: data.type === 'selected' || data.type === 'course' ? data.courses : [],
            discount_type: normalizedDiscountType,
            discount_value: data.discount_value,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            max_uses_total: data.max_uses_total,
            max_uses_per_user: data.max_uses_per_user,
            min_order_amount: data.min_order_amount,
            max_discount: data.max_discount,
        };

        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
                delete payload[key];
            }
        });

        const response = await api.post<any>('promocode', payload);
        return response.data;
    },

    update: async (id: string, data: PromoCodeUpdateReq): Promise<PromoCode> => {
        const response = await api.put<PromoCode>(`promocode/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`promocode/${id}/delete`);
    },

    getRedemptions: async (id: string, page = 1, limit = 10, filters?: any): Promise<PaginatedResponse<PromocodeRedemption>> => {
        const params: any = { page, limit, promo_id: id, promocode_id: id, ...filters };
        const response = await api.get<any>(`promocode/redemption`, { params });
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

    getAllRedemptions: async (page = 1, limit = 10, filters?: { user_id?: string; promo_id?: string; is_active?: string }): Promise<PaginatedResponse<PromocodeRedemption>> => {
        const params: any = { page, limit, ...filters };
        const response = await api.get<any>('promocode/redemption', { params });
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
    }
};
