import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, AlertTriangle, Info, Check } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import api from '../lib/api';
import { formatTime } from '../lib/utils';

export default function Notifications() {
  const qc = useQueryClient();

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <AppLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400">Real-time alerts, AI updates, and route recommendations.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-4 h-20 animate-pulse bg-slate-900/40" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p className="font-semibold text-slate-400">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n: { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }) => (
              <div
                key={n.id}
                onClick={() => !n.read && markReadMutation.mutate(n.id)}
                className={`glass-card p-4 flex items-start gap-4 transition-colors cursor-pointer ${
                  n.read ? 'opacity-70 bg-slate-900/30' : 'border-brand-500/30 bg-slate-900/80'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'CRITICAL' || n.type === 'ALERT' ? 'bg-red-500/10 text-red-400' :
                  n.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'
                }`}>
                  {n.type === 'CRITICAL' || n.type === 'ALERT' ? <AlertTriangle className="w-4 h-4" /> :
                   n.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-slate-300' : 'text-white'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                </div>

                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
