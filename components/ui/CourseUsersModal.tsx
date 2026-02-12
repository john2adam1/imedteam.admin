'use client';

import { useState, useEffect } from 'react';
import { Course, CoursePermission, User } from '@/types';
import { courseService } from '@/services/course.service';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { toast } from 'sonner';

interface CourseUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
}

interface CourseUser extends CoursePermission {
    user_name?: string;
    user_phone?: string;
}

export function CourseUsersModal({ isOpen, onClose, course }: CourseUsersModalProps) {
    const [permissions, setPermissions] = useState<CourseUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && course) {
            loadCourseUsers();
        }
    }, [isOpen, course]);

    const loadCourseUsers = async () => {
        if (!course) return;
        setLoading(true);
        try {
            // Fetch permissions for this course
            const permRes = await courseService.getPermissions(1, 100, { course_id: course.id });
            const perms = permRes.data;

            // Fetch user details for each permission
            // Note: In a real optimized scenario, the permission endpoint should probably expand user details
            // or we accepts that we make multiple requests, or fetch all users and map them.
            // Given the pagination limit (100), fetching all users might be heavy if many users.
            // If the permission object doesn't have user info, we have to fetch it.
            // Let's check the types. CoursePermission has user_id, course_id etc.
            // We need to fetch users. 
            // Better approach: Get all unique user IDs and fetch them? Or just fetch all users if count is low?
            // The `userService.getAll` might support IDs filter? No.
            // Let's assume for now we can fetch all users or the backend provides user info.
            // IF backend doesn't provide user info in permission, this is tricky.
            // Let's try to map with what we have. 
            // Wait, I saw `userService.getAll` earlier. 
            // Actually, maybe `courseService.getPermissions` returns SOME user info? 
            // The type `CoursePermission` in `types/index.ts` only has IDs.
            // Let's assume we need to fetch user details one by one or get a list. 
            // Optimization: Fetch all users once (cached) or use a "get users by ids" endpoint if available.
            // Since we don't have "get users by ids", and fetching 100 users individually is bad to do in frontend loop...
            // I'll fetch ALL users (up to reasonable limit) to map names.

            const usersRes = await userService.getAll(1, 1000); // Fetch a large batch
            const usersMap = new Map(usersRes.data.map((u: User) => [u.id, u]));

            const enrichedPerms = perms.map(p => ({
                ...p,
                user_name: usersMap.get(p.user_id)?.name || 'Unknown',
                user_phone: usersMap.get(p.user_id)?.phone_number || '-'
            }));

            setPermissions(enrichedPerms);

        } catch (error) {
            console.error('Failed to load course users:', error);
            toast.error('Foydalanuvchilarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (permissionId: string) => {
        if (!confirm('Haqiqatan ham bu foydalanuvchining ruxsatini bekor qilmoqchimisiz?')) return;
        try {
            await courseService.deletePermission(permissionId);
            toast.success('Ruxsat bekor qilindi');
            loadCourseUsers();
        } catch (error) {
            console.error('Failed to revoke permission:', error);
            toast.error('Ruxsatni bekor qilishda xatolik');
        }
    };

    const columns = [
        {
            key: 'user',
            header: 'Foydalanuvchi',
            render: (item: CourseUser) => (
                <div>
                    <div className="font-medium">{item.user_name}</div>
                    <div className="text-xs text-gray-500">{item.user_phone}</div>
                </div>
            )
        },
        {
            key: 'dates',
            header: 'Muddat',
            render: (perm: CourseUser) => (
                <div className="text-xs">
                    <div>Boshlanish: {new Date(perm.started_at).toLocaleDateString()}</div>
                    <div>Tugash: {new Date(perm.ended_at).toLocaleDateString()}</div>
                </div>
            )
        },
        {
            key: 'active',
            header: 'Holat',
            render: (perm: CourseUser) => {
                const isActive = new Date(perm.ended_at) > new Date();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isActive ? 'Faol' : 'Tugagan'}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Amal',
            render: (perm: CourseUser) => (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(perm.id)}
                    className="h-7 px-2 text-xs"
                >
                    O'chirish
                </Button>
            )
        }
    ];

    if (!course) return null;

    const courseName = typeof course.name === 'string' ? course.name : (course.name?.uz || course.name?.ru || course.name?.en);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${courseName} - Foydalanuvchilar`}
            maxWidth="3xl"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-4">Yuklanmoqda...</div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        <Table
                            data={permissions}
                            columns={columns}
                        />
                        {permissions.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Bu kursga a'zo foydalanuvchilar yo'q
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>Yopish</Button>
                </div>
            </div>
        </Modal>
    );
}
