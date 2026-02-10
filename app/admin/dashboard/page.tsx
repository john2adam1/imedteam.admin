'use client';

import { useEffect, useState, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardRes, GetDashboardReq } from '@/types';
import { StatCard, DashboardSkeleton } from '@/components/dashboard/StatCard';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetDashboardReq>({ type: 'month' });

  const loadStats = useCallback(async (params: GetDashboardReq) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (params: GetDashboardReq) => {
    setFilters(params);
    loadStats(params);
  };

  const getHelperText = () => {
    if (filters.type === 'day') return `Date: ${filters.day}`;
    if (filters.type === 'range') return `Range: ${filters.from} to ${filters.to}`;
    return `Selected period: ${filters.type}`;
  };

  const isEmpty = stats && Object.values(stats).every(val => val === 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <div className="flex gap-2">
          {/* Demo Toggle for Testing Empty State */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange({ type: 'range', from: '2000-01-01', to: '2000-01-01' })}
          >
            Test Empty State
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadStats(filters)}>
            Refresh
          </Button>
        </div>
      </div>

      <DashboardFilters onFilter={handleFilterChange} initialValues={filters} />

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex justify-between items-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button size="sm" onClick={() => loadStats(filters)} variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : stats ? (
        <>
          {isEmpty && (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-muted-foreground italic">No data available for the selected period.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Tariffs" value={stats.tariffs} helperText={getHelperText()} icon="💰" />
            <StatCard label="Subjects" value={stats.subjects} helperText={getHelperText()} icon="📁" />
            <StatCard label="Courses" value={stats.courses} helperText={getHelperText()} icon="🎓" />
            <StatCard label="Modules" value={stats.modules} helperText={getHelperText()} icon="📦" />
            <StatCard label="Lessons" value={stats.lessons} helperText={getHelperText()} icon="📖" />
            <StatCard label="Tests" value={stats.tests} helperText={getHelperText()} icon="📝" />
            <StatCard label="Documents" value={stats.documents} helperText={getHelperText()} icon="📄" />
            <StatCard label="Videos" value={stats.videos} helperText={getHelperText()} icon="🎬" />
            <StatCard label="Users" value={stats.users} helperText={getHelperText()} icon="👥" />
            <StatCard label="Teachers" value={stats.teachers} helperText={getHelperText()} icon="👨‍🏫" />
          </div>
        </>
      ) : null}
    </div>
  );
}

