import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Inbox, ThumbsDown, Wrench } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { CATEGORIES } from '../../types';
import { PageHeader, StatCard } from '../../components/ui/Common';
import { OverdueBadge, PriorityBadge } from '../../components/ui/Badges';
import { daysOverdue, fmtDate, fmtRange, isOverdue, todayStr, userName } from '../../utils/format';

export default function AdminDashboard() {
  const { db } = useApp();
  const nav = useNavigate();
  const cs = db.complaints;
  const n = (...s: string[]) => cs.filter((c) => s.includes(c.status)).length;
  const pending = cs.filter((c) => c.status === 'pending_review').sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const overdue = cs.filter(isOverdue);
  const today = db.appointments.filter((a) => a.status !== 'cancelled' && a.date === todayStr()).sort((a, b) => a.time.localeCompare(b.time));
  const max = Math.max(1, ...CATEGORIES.map((c) => cs.filter((x) => x.category === c).length));
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Complaint queue, scheduled visits and workload at a glance." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Pending review" value={n('pending_review')} tone="amber" icon={<Inbox />} onClick={() => nav('/admin/pending')} />
        <StatCard label="Approved, awaiting booking" value={n('approved')} tone="blue" icon={<CheckCircle2 />} onClick={() => nav('/admin/approved')} />
        <StatCard label="Scheduled / in progress" value={n('scheduled', 'in_progress')} tone="slate" icon={<CalendarDays />} onClick={() => nav('/admin/scheduled')} />
        <StatCard label="Overdue" value={overdue.length} tone="red" icon={<AlertTriangle />} onClick={() => nav('/admin/overdue')} />
        <StatCard label="Awaiting user confirmation" value={n('work_completed')} tone="slate" icon={<Wrench />} />
        <StatCard label="Closed" value={n('closed')} tone="green" icon={<CheckCircle2 />} />
        <StatCard label="Rejected" value={n('rejected')} tone="red" icon={<ThumbsDown />} onClick={() => nav('/admin/rejected')} />
        <StatCard label="Total complaints" value={cs.length} icon={<ClipboardList />} onClick={() => nav('/admin/all')} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-title flex items-center justify-between">Oldest pending reviews <Link to="/admin/pending" className="text-xs font-normal text-blue-700 hover:underline">View all</Link></div>
          {pending.length === 0 ? <p className="p-4 text-sm text-slate-500">The review queue is empty.</p> : (
            <ul>{pending.slice(0, 5).map((c) => (
              <li key={c.id} className="border-b border-slate-100 last:border-0">
                <Link to={`/admin/complaints/${c.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-slate-50">
                  <span className="min-w-0"><span className="block text-sm font-medium text-blue-700">{c.id} · {c.category}</span>
                    <span className="block truncate text-xs text-slate-500">{c.location} {c.room} · {userName(db.users, c.requesterId)} · {fmtDate(c.submittedAt)}</span></span>
                  <span className="flex gap-1">{isOverdue(c) && <OverdueBadge />}<PriorityBadge priority={c.priority} /></span>
                </Link>
              </li>))}</ul>
          )}
        </div>
        <div className="card">
          <div className="card-title">Today's visits</div>
          {today.length === 0 ? <p className="p-4 text-sm text-slate-500">No visits today.</p> : (
            <ul>{today.map((a) => (
              <li key={a.id} className="border-b border-slate-100 last:border-0">
                <Link to={`/admin/complaints/${a.complaintId}`} className="block px-4 py-2.5 hover:bg-slate-50">
                  <span className="block text-sm font-medium">{fmtRange(a.time)} · {userName(db.users, a.workerId)}</span>
                  <span className="block text-xs text-slate-500">{a.complaintId} · {db.complaints.find((c) => c.id === a.complaintId)?.category}</span>
                </Link>
              </li>))}</ul>
          )}
        </div>
        <div className="card">
          <div className="card-title">Complaints by category</div>
          <div className="space-y-2 p-4">
            {CATEGORIES.map((c) => { const k = cs.filter((x) => x.category === c).length; return (
              <div key={c} className="flex items-center gap-2 text-sm">
                <span className="w-36 shrink-0 truncate text-slate-600">{c}</span>
                <div className="h-3 flex-1 rounded bg-slate-100"><div className="h-3 rounded bg-blue-600" style={{ width: `${(k / max) * 100}%` }} /></div>
                <span className="w-6 text-right text-slate-700">{k}</span>
              </div>); })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Overdue complaints</div>
          {overdue.length === 0 ? <p className="p-4 text-sm text-slate-500">Nothing is overdue.</p> : (
            <ul>{overdue.slice(0, 5).map((c) => (
              <li key={c.id} className="border-b border-slate-100 last:border-0">
                <Link to={`/admin/complaints/${c.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-slate-50">
                  <span className="text-sm"><span className="font-medium text-blue-700">{c.id}</span> · {c.category}</span>
                  <OverdueBadge days={daysOverdue(c)} />
                </Link>
              </li>))}</ul>
          )}
        </div>
      </div>
    </div>
  );
}
