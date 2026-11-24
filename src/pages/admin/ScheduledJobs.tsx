import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { EmptyState, PageHeader } from '../../components/ui/Common';
import { StatusBadge } from '../../components/ui/Badges';
import { fmtDay, fmtRange, todayStr, userName } from '../../utils/format';

export default function ScheduledJobs() {
  const { db } = useApp();
  const [worker, setWorker] = useState('');
  const [range, setRange] = useState<'upcoming' | 'all'>('upcoming');
  const workers = db.users.filter((u) => u.role === 'worker');
  const rows = useMemo(() => db.appointments
    .filter((a) => a.status === 'booked' && (!worker || a.workerId === worker) && (range === 'all' || a.date >= todayStr()))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [db.appointments, worker, range]);
  const dates = [...new Set(rows.map((r) => r.date))];
  return (
    <div>
      <PageHeader title="Scheduled Jobs" subtitle="Booked technician visits, grouped by date." />
      <div className="mb-3 flex flex-wrap gap-2">
        <select className="input w-auto" value={worker} onChange={(e) => setWorker(e.target.value)} aria-label="Filter by worker"><option value="">All workers</option>{workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select className="input w-auto" value={range} onChange={(e) => setRange(e.target.value as 'upcoming' | 'all')} aria-label="Date range"><option value="upcoming">Today onwards</option><option value="all">Include past</option></select>
      </div>
      {dates.length === 0 ? <div className="card"><EmptyState title="No scheduled visits" text="Visits appear here once users book slots." /></div> : dates.map((d) => (
        <div key={d} className="card mb-3">
          <div className="card-title">{fmtDay(d)}{d === todayStr() && <span className="ml-2 rounded bg-blue-700 px-1.5 py-0.5 text-xs text-white">Today</span>}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr><th className="th">Time</th><th className="th">Worker</th><th className="th">Complaint</th><th className="th">Location</th><th className="th">Raised by</th><th className="th">Status</th></tr></thead>
              <tbody>{rows.filter((r) => r.date === d).map((a) => {
                const c = db.complaints.find((x) => x.id === a.complaintId)!;
                return (
                  <tr key={a.id} className="hover:bg-blue-50/50">
                    <td className="td whitespace-nowrap">{fmtRange(a.time)}</td>
                    <td className="td">{userName(db.users, a.workerId)}</td>
                    <td className="td"><Link className="font-medium text-blue-700 hover:underline" to={`/admin/complaints/${c.id}`}>{c.id}</Link><span className="block text-xs text-slate-500">{c.category}</span></td>
                    <td className="td">{c.location}<span className="block text-xs text-slate-500">{c.room}</span></td>
                    <td className="td">{userName(db.users, c.requesterId)}</td>
                    <td className="td"><StatusBadge status={c.status} /></td>
                  </tr>);
              })}</tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
