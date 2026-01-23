'use client';

import { useEffect, useState } from 'react';
import { subjectService } from '@/services/subject.service';
import { courseService } from '@/services/course.service';
import { userService } from '@/services/user.service';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    categories: 0,
    courses: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subjectsRes, coursesRes, usersRes] = await Promise.all([
          subjectService.getAll(1, 1),
          courseService.getAll(undefined, 1, 1),
          userService.getAll(1, 1),
        ]);

        setStats({
          categories: subjectsRes.meta.total_items,
          courses: coursesRes.meta.total_items,
          users: usersRes.meta.total_items,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Categories</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.categories}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Courses</h2>
          <p className="text-3xl font-bold text-green-600">{stats.courses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.users}</p>
        </div>
      </div>
    </div>
  );
}

