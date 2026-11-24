import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, ClipboardList, PlayCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { EmptyState, PageHeader, StatCard } from '../../components/ui/Common';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { fmtDate, fmtRange, todayStr } from '../../utils/format';

export default function WorkerDashboard() {
  const { db, me } = useApp();
  const nav = useNavigate();
  const today = todayStr();
  const mine = db.complaints.filter((c) => c.assignedWorkerId === me!.id);
  const appts = db.appointments.filter((a) => a.workerId === me!.id && a.status === 'booked').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const todays = appts.filter((a) => a.date === today);
  const later = appts.filter((a) => a.date > today);
  const row = (a: (typeof appts)[number], showDate: boolean) => {
    const c = db.complaints.find((x) => x.id === a.complaintId)!;
    return (
      <li key={a.id} className="border-b border-slate-100 last:border-0">
        <Link to={`/jobs/${c.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-slate-50">
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-800">{showDate && `${fmtDate(a.date)} · `}{fmtRange(a.time)}</span>
            <span className="block truncate text-xs text-slate-500">{c.id} · {c.category} · {c.location}, {c.room}</span>
          </span>
          <span className="flex gap-1"><PriorityBadge priority={c.priority} /><StatusBadge status={c.status} /></span>
        </Link>
      </li>
    );
  };
  return (
    <div>
      <PageHeader title={`Hello, ${me!.name.split(' ')[0]}`} subtitle="Your jobs and appointments." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Assigned jobs" value={mine.filter((c) => c.status !== 'closed').length} icon={<ClipboardList />} onClick={() => nav('/jobs')} />
        <StatCard label="Today's appointments" value={todays.length} tone="amber" icon={<CalendarCheck />} onClick={() => nav('/jobs?tab=today')} />
        <StatCard label="In progress" value={mine.filter((c) => c.status === 'in_progress').length} tone="slate" icon={<PlayCircle />} />
        <StatCard label="Completed" value={mine.filter((c) => c.status === 'work_completed' || c.status === 'closed').length} tone="green" icon={<CheckCircle2 />} onClick={() => nav('/jobs?tab=completed')} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card"><div className="card-title">Today's appointments</div>{todays.length ? <ul>{todays.map((a) => row(a, false))}</ul> : <EmptyState title="No appointments today" />}</div>
        <div className="card"><div className="card-title">Upcoming</div>{later.length ? <ul>{later.slice(0, 6).map((a) => row(a, true))}</ul> : <EmptyState title="No upcoming appointments" />}</div>
      </div>
    </div>
  );
}
