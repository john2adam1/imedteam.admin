'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/subjects', label: 'Subjects', icon: '📁' },
  { path: '/admin/sources', label: 'Sources', icon: '📎' },
  { path: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { path: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
  { path: '/admin/about', label: 'About', icon: 'ℹ️' },
  { path: '/admin/contact', label: 'Contact', icon: '📞' },
  { path: '/admin/faq', label: 'FAQ', icon: '❓' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Check if pathname starts with the item path for nested routes
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

