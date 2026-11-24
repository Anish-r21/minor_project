import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORIES, Complaint, Status, STATUS_LABEL } from '../../types';
import { useApp } from '../../store/AppContext';
import { activeAppt, daysOverdue, fmtDate, fmtTime, isOverdue, lastAppt, userName } from '../../utils/format';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../ui/Badges';
import { EmptyState } from '../ui/Common';

export function useComplaintBase() {
  const { me } = useApp();
  return me?.role === 'admin' ? '/admin/complaints' : me?.role === 'worker' ? '/jobs' : '/complaints';
}

interface Props {
  complaints: Complaint[];
  showRequester?: boolean;
  showPriority?: boolean;
  showWorker?: boolean;
  statusFilter?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  pageSize?: number;
}

export function ComplaintTable({ complaints, showRequester, showPriority, showWorker = true, statusFilter = true, emptyTitle = 'No complaints found', emptyText, pageSize = 10 }: Props) {
  const { db } = useApp();
  const nav = useNavigate();
  const base = useComplaintBase();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | Status>('');
  const [cat, setCat] = useState('');
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return complaints.filter((c) =>
      (!status || c.status === status) && (!cat || c.category === cat) &&
      (!s || [c.id, c.category, c.location, c.room, c.description, userName(db.users, c.requesterId)].some((v) => v.toLowerCase().includes(s))));
  }, [complaints, q, status, cat, db.users]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const view = rows.slice(cur * pageSize, cur * pageSize + pageSize);

  return (
    <div className="card">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input className="input pl-8" placeholder="Search ID, location, description…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} aria-label="Search complaints" />
        </div>
        {statusFilter && (
          <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value as Status | ''); setPage(0); }} aria-label="Filter by status">
            <option value="">All statuses</option>
            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        )}
        <select className="input w-auto" value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {view.length === 0 ? <EmptyState title={emptyTitle} text={emptyText ?? 'Try changing the search or filters.'} /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr>
                <th className="th">Complaint ID</th><th className="th">Category</th><th className="th">Location</th>
                {showRequester && <th className="th">Raised by</th>}
                <th className="th">Submitted</th><th className="th">Status</th>
                {showPriority && <th className="th">Priority</th>}
                {showWorker && <th className="th">Worker</th>}
                <th className="th">Appointment</th>
              </tr>
            </thead>
            <tbody>
              {view.map((c) => {
                const ap = activeAppt(db, c.id) ?? lastAppt(db, c.id);
                return (
                  <tr key={c.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => nav(`${base}/${c.id}`)}>
                    <td className="td"><button className="font-medium text-blue-700 hover:underline" onClick={(e) => { e.stopPropagation(); nav(`${base}/${c.id}`); }}>{c.id}</button></td>
                    <td className="td">{c.category}</td>
                    <td className="td">{c.location}<span className="block text-xs text-slate-500">{c.room}</span></td>
                    {showRequester && <td className="td">{userName(db.users, c.requesterId)}</td>}
                    <td className="td whitespace-nowrap">{fmtDate(c.submittedAt)}</td>
                    <td className="td"><div className="flex flex-col items-start gap-1"><StatusBadge status={c.status} />{isOverdue(c) && <OverdueBadge days={daysOverdue(c)} />}</div></td>
                    {showPriority && <td className="td"><PriorityBadge priority={c.priority} /></td>}
                    {showWorker && <td className="td">{c.assignedWorkerId ? userName(db.users, c.assignedWorkerId) : <span className="text-slate-400">Not assigned</span>}</td>}
                    <td className="td whitespace-nowrap">{ap ? <>{fmtDate(ap.date)}<span className="block text-xs text-slate-500">{fmtTime(ap.time)}</span></> : <span className="text-slate-400">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
        <span>{rows.length} complaint{rows.length === 1 ? '' : 's'}</span>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button className="btn-secondary px-2 py-1 text-xs" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</button>
            <span>Page {cur + 1} of {pages}</span>
            <button className="btn-secondary px-2 py-1 text-xs" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
