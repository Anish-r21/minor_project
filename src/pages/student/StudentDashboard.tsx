import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CalendarCheck, CheckCircle2, ClipboardList, Clock, FilePlus2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ComplaintTable } from '../../components/complaint/ComplaintTable';
import { PageHeader, StatCard } from '../../components/ui/Common';
import { StatusBadge } from '../../components/ui/Badges';
import { activeAppt, fmtDate, fmtRange } from '../../utils/format';

export default function StudentDashboard() {
  const { db, me } = useApp();
  const nav = useNavigate();
  const mine = db.complaints.filter((c) => c.requesterId === me!.id);
  const count = (...s: string[]) => mine.filter((c) => s.includes(c.status)).length;
  const actions = mine.filter((c) => c.status === 'approved' || c.status === 'work_completed' || c.status === 'rejected');
  const upcoming = mine.map((c) => ({ c, a: activeAppt(db, c.id) })).filter((x) => x.a).sort((x, y) => (x.a!.date + x.a!.time).localeCompare(y.a!.date + y.a!.time));
  return (
    <div>
      <PageHeader title={`Welcome, ${me!.name.split(' ')[0]}`} subtitle="Track your maintenance complaints and book technician visits."
        actions={<Link to="/complaints/new" className="btn-primary"><FilePlus2 size={16} /> Submit complaint</Link>} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total complaints" value={mine.length} icon={<ClipboardList />} onClick={() => nav('/complaints')} />
        <StatCard label="Pending review" value={count('pending_review')} tone="amber" icon={<Clock />} />
        <StatCard label="Action required" value={count('approved', 'work_completed')} tone="red" icon={<AlertCircle />} />
        <StatCard label="Scheduled / in progress" value={count('scheduled', 'in_progress')} tone="slate" icon={<CalendarCheck />} />
        <StatCard label="Closed" value={count('closed')} tone="green" icon={<CheckCircle2 />} />
      </div>
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-title">Needs your attention</div>
          {actions.length === 0 ? <p className="p-4 text-sm text-slate-500">Nothing needs your action right now.</p> : (
            <ul>{actions.map((c) => (
              <li key={c.id} className="border-b border-slate-100 last:border-0">
                <Link to={`/complaints/${c.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-slate-50">
                  <span className="min-w-0"><span className="block text-sm font-medium text-blue-700">{c.id} · {c.category}</span>
                    <span className="block truncate text-xs text-slate-500">{c.status === 'approved' ? 'Approved. Book a technician slot.' : c.status === 'work_completed' ? 'Work done. Confirm if resolved.' : 'Rejected. See the reason.'}</span></span>
                  <StatusBadge status={c.status} />
                </Link>
              </li>))}</ul>
          )}
        </div>
        <div className="card">
          <div className="card-title">Upcoming visits</div>
          {upcoming.length === 0 ? <p className="p-4 text-sm text-slate-500">No visits scheduled.</p> : (
            <ul>{upcoming.map(({ c, a }) => (
              <li key={c.id} className="border-b border-slate-100 last:border-0">
                <Link to={`/complaints/${c.id}`} className="block px-4 py-2.5 hover:bg-slate-50">
                  <span className="block text-sm font-medium text-slate-800">{fmtDate(a!.date)} · {fmtRange(a!.time)}</span>
                  <span className="block text-xs text-slate-500">{c.id} · {c.category} · {db.users.find((u) => u.id === a!.workerId)?.name}</span>
                </Link>
              </li>))}</ul>
          )}
        </div>
      </div>
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Recent complaints</h2>
      <ComplaintTable complaints={mine.slice(0, 5)} statusFilter={false} pageSize={5} />
    </div>
  );
}
