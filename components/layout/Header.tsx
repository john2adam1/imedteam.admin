'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/admin/login');
  };

  return (
    <header className="border-b bg-background px-6 py-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Boshqaruv Paneli</h2>
      <Button onClick={handleLogout} variant="destructive" size="sm">
        Chiqish
      </Button>
    </header>
  );
}

