'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === '/admin/login') {
      return;
    }

    // Check authentication for all other admin routes
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router, pathname]);

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

