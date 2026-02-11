'use client';

import { useState, useEffect } from 'react';
import { User, Course, Tariff } from '@/types';
import { userService } from '@/services/user.service';
import { courseService } from '@/services/course.service';
import { tariffService } from '@/services/tariff.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { PasswordUpdateModal } from '@/components/ui/PasswordUpdateModal';
import { CoursePermissionModal } from '@/components/ui/CoursePermissionModal';
import { SearchFilters, FilterConfig } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedUserForPermission, setSelectedUserForPermission] = useState<User | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;


  useEffect(() => {
    loadData();
  }, [activeFilters, page]);


  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, coursesResponse, tariffsResponse] = await Promise.all([
        userService.getAll(page, limit, activeFilters),
        courseService.getAll(),
        tariffService.getAll(),
      ]);
      setUsers(usersResponse.data);
      setTotalItems(usersResponse.meta?.total_items || usersResponse.data.length);

      setCourses(coursesResponse.data);
      setTariffs(tariffsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordClick = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordUpdate = async (userId: string, role: string) => {
    try {
      const response = await userService.resetPassword(userId, role);
      // alert('Password reset successfully'); // No alert needed, modal shows the password
      // setIsPasswordModalOpen(false); // Don't close immediately, let user see password in modal
      // setSelectedUser(null);
      return response.password;
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      // Error is handled in the modal component
      throw error;
    }
  };

  const handleGrantPermissionClick = (user: User) => {
    setSelectedUserForPermission(user);
    setIsPermissionModalOpen(true);
  };

  const handleGrantPermission = async (data: { userId: string, courseId: string, tariffId: string, startedAt: string, endedAt: string }) => {
    try {
      await courseService.grantPermission({
        user_id: data.userId,
        course_id: data.courseId,
        tariff_id: data.tariffId,
        started_at: data.startedAt,
        ended_at: data.endedAt
      });
      alert('Kursga ruxsat muvaffaqiyatli berildi');
      setIsPermissionModalOpen(false);
      setSelectedUserForPermission(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to grant permission:', error);
      // Error is handled in the modal component
      throw error;
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Haqiqatan ham ${user.name} foydalanuvchisini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      await userService.delete(user.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Foydalanuvchini o\'chirishda xatolik');
    }
  };


  const columns = [
    {
      key: 'name',
      header: 'Ism',
      render: (item: User) => item.name
    },
    { key: 'phone_number', header: 'Telefon' },
    {
      key: 'created_at',
      header: 'Yaratilgan vaqti',
      render: (item: User) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Amallar',
      render: (item: User) => (
        <div className="flex gap-2">
          <Button onClick={() => handleGrantPermissionClick(item)} variant="outline" size="sm">
            Kursga ruxsat berish
          </Button>
          <Button onClick={() => handlePasswordClick(item)} variant="outline" size="sm">
            Parolni tiklash
          </Button>
          <Button onClick={() => handleDelete(item)} variant="destructive" size="sm">
            O'chirish
          </Button>
        </div>
      ),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    { key: 'name', label: 'Ism', type: 'text', placeholder: 'Ism bo\'yicha qidirish...' },
    { key: 'phone_number', label: 'Telefon', type: 'text', placeholder: 'Telefon bo\'yicha qidirish...' },
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { value: 'user', label: 'Foydalanuvchi' },
        { value: 'admin', label: 'Admin' },
        { value: 'moderator', label: 'Moderator' },
      ],
    },
    { key: 'is_blocked', label: 'Bloklangan', type: 'boolean' },
  ];

  if (loading && users.length === 0) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Foydalanuvchilar</h1>

      <SearchFilters configs={filterConfigs} onFilter={setActiveFilters} />

      <Table data={users} columns={columns} />

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        perPage={limit}
        onPageChange={setPage}
      />


      <PasswordUpdateModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        defaultRole="user"
        onSubmit={handlePasswordUpdate}
      />

      <CoursePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setSelectedUserForPermission(null);
        }}
        user={selectedUserForPermission}
        courses={courses}
        tariffs={tariffs}
        onSubmit={handleGrantPermission}
      />
    </div>
  );
}

