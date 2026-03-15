'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';

const NAV_ITEMS = [
  { section: 'Overview' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊', badge: null },
  { section: 'Code Review' },
  { href: '/reviews', label: 'All Reviews', icon: '📝', badge: '5' },
  { href: '/reviews/r1', label: 'Live Review', icon: '⚡', badge: null },
  { section: 'Management' },
  { href: '/admin', label: 'Team & Roles', icon: '👥', badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">CR</div>
        <div>
          <h1>CodeReview Pro</h1>
          <span>Collaborative Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => {
          if ('section' in item && !('href' in item)) {
            return (
              <div key={i} className="sidebar-section-title">
                {item.section}
              </div>
            );
          }
          const navItem = item as { href: string; label: string; icon: string; badge: string | null };
          const isActive = pathname === navItem.href || (navItem.href !== '/dashboard' && pathname.startsWith(navItem.href) && navItem.href.length > 1);
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{navItem.icon}</span>
              {navItem.label}
              {navItem.badge && <span className="nav-badge">{navItem.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: user.avatarColor }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role.replace('_', ' ')}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
