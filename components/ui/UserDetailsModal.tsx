'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import { toast } from 'sonner';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export function UserDetailsModal({ isOpen, onClose, userId }: UserDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User & { image_url?: string; language?: string } | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            loadUser();
        } else {
            setUser(null);
        }
    }, [isOpen, userId]);

    const loadUser = async () => {
        try {
            setLoading(true);
            const data = await userService.getById(userId!);
            setUser(data);
        } catch (error) {
            console.error(error);
            toast.error("Foydalanuvchi ma'lumotlarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Foydalanuvchi ma'lumotlari" maxWidth="max-w-md">
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : user ? (
                    <div className="flex flex-col items-center">
                        {user.image_url ? (
                            <img src={user.image_url} alt={user.name || 'User'} className="w-24 h-24 rounded-full object-cover mb-4 shadow-sm" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 text-3xl font-bold mb-4 shadow-sm">
                                {(user.name || user.first_name || 'U').charAt(0)}
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-slate-900">{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Nomsiz foydalanuvchi'}</h3>
                        <p className="text-sm text-slate-500 font-mono mt-1 mb-6">@{user.id}</p>

                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-slate-500 text-sm font-medium">Telefon:</span>
                                <span className="text-slate-900 font-semibold">{user.phone_number || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-slate-500 text-sm font-medium">Email:</span>
                                <span className="text-slate-900 font-semibold">{user.email || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-slate-500 text-sm font-medium">Til:</span>
                                <span className="text-slate-900 font-semibold">{user.language ? user.language.toUpperCase() : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-slate-500 text-sm font-medium">Yaratilgan vaqti:</span>
                                <span className="text-slate-900 font-semibold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 text-slate-400">
                        Foydalanuvchi topilmadi
                    </div>
                )}
            </div>
        </Modal>
    );
}
