import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { WEEKDAYS } from '../../types';
import { fmtDate, fmtRange, todayStr } from '../../utils/format';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, Field, PageHeader } from '../../components/ui/Common';

export default function Workers() {
  const { db, toggleWorkerDay, addLeave, removeLeave, toast } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const [leave, setLeave] = useState('');
  const workers = db.users.filter((u) => u.role === 'worker');
  const w = workers.find((x) => x.id === sel);
  const today = todayStr();
  const state = (id: string) => {
    const u = workers.find((x) => x.id === id)!;
    if (u.leaveDates?.includes(today)) return { t: 'On leave', c: 'bg-slate-200 text-slate-700' };
    if (!u.availableDays?.includes(new Date().getDay())) return { t: 'Day off', c: 'bg-slate-200 text-slate-700' };
    if (db.appointments.some((a) => a.workerId === id && a.date === today && a.status === 'booked')) return { t: 'Busy today', c: 'bg-amber-100 text-amber-800' };
    return { t: 'Available', c: 'bg-green-100 text-green-800' };
  };
  const upcoming = (id: string) => db.appointments.filter((a) => a.workerId === id && a.status === 'booked' && a.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const clash = leave ? upcoming(sel!).filter((a) => a.date === leave).length : 0;

  return (
    <div>
      <PageHeader title="Workers" subtitle="Manage working days and leave. Slots shown to users are generated from this availability." />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead><tr><th className="th">Worker</th><th className="th">Skills</th><th className="th">Working days</th><th className="th">Today</th><th className="th">Booked visits</th><th className="th" /></tr></thead>
          <tbody>{workers.map((u) => { const s = state(u.id); return (
            <tr key={u.id} className="hover:bg-blue-50/50">
              <td className="td"><span className="font-medium">{u.name}</span><span className="block text-xs text-slate-500">{u.identifier} · {u.phone}</span></td>
              <td className="td">{u.skills?.join(', ')}</td>
              <td className="td">{u.availableDays?.map((d) => WEEKDAYS[d]).join(', ')}</td>
              <td className="td"><span className={`rounded px-2 py-0.5 text-xs font-medium ${s.c}`}>{s.t}</span></td>
              <td className="td">{upcoming(u.id).length}</td>
              <td className="td text-right"><button className="btn-secondary px-2 py-1 text-xs" onClick={() => { setSel(u.id); setLeave(''); }}>Manage</button></td>
            </tr>); })}</tbody>
        </table>
      </div>
      <Modal open={!!w} title={w ? `Manage ${w.name}` : ''} wide onClose={() => setSel(null)} footer={<button className="btn-primary" onClick={() => setSel(null)}>Done</button>}>
        {w && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Working days</p>
              <div className="flex flex-wrap gap-2">{WEEKDAYS.map((d, i) => { const on = w.availableDays?.includes(i); return (
                <button key={d} aria-pressed={on} onClick={() => toggleWorkerDay(w.id, i)} className={`rounded border px-3 py-1.5 text-sm ${on ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-600'}`}>{d}</button>); })}</div>
              <p className="mt-1 text-xs text-slate-500">Changes apply to newly generated slots. Existing bookings are not moved.</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Leave dates</p>
              <div className="flex flex-wrap items-end gap-2">
                <Field label="Add leave"><input type="date" className="input" min={today} value={leave} onChange={(e) => setLeave(e.target.value)} /></Field>
                <button className="btn-secondary" disabled={!leave} onClick={() => { addLeave(w.id, leave); toast('Leave added. Slots on that day are hidden.'); setLeave(''); }}><Plus size={15} /> Add</button>
              </div>
              {clash > 0 && <p className="mt-1 text-xs text-amber-700">{clash} booked visit(s) fall on this date. Reassign them from the complaint page.</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {w.leaveDates?.length ? w.leaveDates.map((d) => <span key={d} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs">{fmtDate(d)}<button aria-label={`Remove leave ${d}`} onClick={() => removeLeave(w.id, d)}><X size={12} /></button></span>) : <span className="text-sm text-slate-500">No leave scheduled.</span>}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Upcoming visits</p>
              {upcoming(w.id).length === 0 ? <EmptyState title="No upcoming visits" /> : (
                <ul className="divide-y divide-slate-100 rounded border border-slate-200">{upcoming(w.id).map((a) => (
                  <li key={a.id} className="px-3 py-2 text-sm"><Link className="font-medium text-blue-700 hover:underline" to={`/admin/complaints/${a.complaintId}`}>{a.complaintId}</Link> · {fmtDate(a.date)}, {fmtRange(a.time)}</li>))}</ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
