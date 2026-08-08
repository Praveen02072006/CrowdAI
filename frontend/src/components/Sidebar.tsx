import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Bus, Star, Bell, User, Zap,
  LogOut, Map, Shield, ChevronRight, Settings, Activity,
  Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  const isOperator = user?.role === 'OPERATOR' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  const passengerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/search', icon: Search, label: 'Search Routes' },
    { to: '/recommendations', icon: Star, label: 'AI Recommendations' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const operatorLinks = [
    { to: '/operator', icon: Activity, label: 'Operator Dashboard' },
  ];

  const adminLinks = [
    { to: '/admin/ai', icon: Zap, label: 'AI Analytics' },
  ];

  const systemLinks = [
    { to: '/simulator', icon: Radio, label: 'Device Simulator' },
    { to: '/technology', icon: Shield, label: 'Technology' },
  ];

  const handleClick = () => { if (mobile && onClose) onClose(); };

  return (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="Yatra IQ Logo" className="w-56 h-auto object-contain" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">

        {/* Passenger */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Passenger</p>
          {passengerLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Operator */}
        {isOperator && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Operator</p>
            {operatorLinks.map(link => (
              <NavLink key={link.to} to={link.to} onClick={handleClick}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <link.icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {/* Admin */}
        {isAdmin && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Admin</p>
            {adminLinks.map(link => (
              <NavLink key={link.to} to={link.to} onClick={handleClick}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <link.icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {/* System */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">System</p>
          {systemLinks.map(link => (
            <NavLink key={link.to} to={link.to} onClick={handleClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <link.icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800/60 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-slate-500"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
