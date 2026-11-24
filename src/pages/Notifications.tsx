import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { fmtDateTime } from '../utils/format';
import { EmptyState, PageHeader } from '../components/ui/Common';

export default function Notifications() {
  const { db, me, markRead, markAllRead } = useApp();
  const nav = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const base = me!.role === 'admin' ? '/admin/complaints' : me!.role === 'worker' ? '/jobs' : '/complaints';
  const mine = db.notifications.filter((n) => n.userId === me!.id);
  const list = unreadOnly ? mine.filter((n) => !n.read) : mine;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle={`${mine.filter((n) => !n.read).length} unread`}
        actions={<>
          <button className="btn-secondary" onClick={() => setUnreadOnly(!unreadOnly)}>{unreadOnly ? 'Show all' : 'Unread only'}</button>
          <button className="btn-secondary" onClick={markAllRead}><CheckCheck size={15} /> Mark all read</button>
        </>} />
      <div className="card">
        {list.length === 0 ? <EmptyState title="You're all caught up" text="Updates on your complaints will appear here." /> : (
          <ul>
            {list.map((n) => (
              <li key={n.id}>
                <button className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${n.read ? '' : 'bg-blue-50/60'}`}
                  onClick={() => { markRead(n.id); if (n.complaintId) nav(`${base}/${n.complaintId}`); }}>
                  <Bell size={16} className={`mt-1 shrink-0 ${n.read ? 'text-slate-300' : 'text-blue-600'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-800">{n.title}</span>
                    <span className="block text-sm text-slate-600">{n.message}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{fmtDateTime(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
