// Authentication utilities for route protection

import { authService } from '@/services/auth.service';
import { redirect } from 'next/navigation';

export function requireAuth() {
  if (typeof window === 'undefined') {
    // Server-side: This will be handled by middleware or layout
    return;
  }

  if (!authService.isAuthenticated()) {
    redirect('/admin/login');
  }
}

