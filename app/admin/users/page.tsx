'use client';

import { useState, useEffect } from 'react';
import { User, Course } from '@/types';
import { userService } from '@/services/user.service';
import { courseService } from '@/services/course.service';
import { Table } from '@/components/ui/Table';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersResponse, coursesResponse] = await Promise.all([
        userService.getAll(),
        courseService.getAll(),
      ]);
      setUsers(usersResponse.data);
      setCourses(coursesResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseNames = (courseIds: string[]): string => {
    if (!courseIds || !Array.isArray(courseIds)) return 'None';
    return courseIds
      .map((id) => {
        const course = courses.find((c) => c.id === id);
        return course ? (course.title.uz || course.title.en) : 'Unknown';
      })
      .join(', ') || 'None';
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'name',
      header: 'Name',
      render: (item: User) => `${item.first_name} ${item.last_name}`.trim()
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'email',
      header: 'Email',
      render: (item: User) => item.email || 'N/A',
    },
    {
      key: 'purchasedCourses',
      header: 'Purchased Courses',
      render: (item: User) => (
        <div className="max-w-md">{getCourseNames(item.purchasedCourses || [])}</div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (item: User) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <Table data={users} columns={columns} />
    </div>
  );
}

