import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <AppLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Profile</h1>
          <p className="text-sm text-slate-400">Account overview and system credentials.</p>
        </div>

        <div className="glass-card p-6 border-brand-500/20">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span className="inline-block mt-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl text-sm">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-semibold text-slate-200">{user?.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl text-sm">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-slate-500">Role & Access</div>
                <div className="font-semibold text-slate-200">{user?.role} Access Rights</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={logout}
              className="btn-danger w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
