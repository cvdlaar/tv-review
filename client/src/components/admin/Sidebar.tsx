import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/admin/screens', label: 'TV-schermen', icon: '📺' },
  { to: '/admin/brands', label: 'Merken', icon: '🏷️' },
  { to: '/admin/review-sources', label: 'Reviewbronnen', icon: '⚙️' },
  { to: '/admin/products', label: 'Producten', icon: '📦' },
  { to: '/admin/sync-logs', label: 'Sync logs', icon: '🔄' },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#005eb8] text-white flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">TV Slides</div>
        <div className="text-xl font-bold">Admin</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-white/50 mb-1">{user?.email}</div>
        <div className="text-xs text-white/70 mb-3 capitalize">{user?.role}</div>
        <button
          onClick={() => logout()}
          className="w-full text-left text-sm text-white/70 hover:text-white transition-colors"
        >
          Uitloggen →
        </button>
      </div>
    </aside>
  );
}
