import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { activeAppt, daysOverdue, dueDate, fmtDate, fmtDateTime, fmtRange, isOverdue, userName } from '../utils/format';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/ui/Badges';
import { EmptyState, InfoRow } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { Timeline } from '../components/ui/Timeline';
import RequesterPanel from '../components/complaint/RequesterPanel';
import AdminPanel from '../components/complaint/AdminPanel';
import WorkerPanel from '../components/complaint/WorkerPanel';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { db, me } = useApp();
  const [photo, setPhoto] = useState<string | null>(null);
  const c = db.complaints.find((x) => x.id === id);
  const role = me!.role;
  const back = role === 'admin' ? '/admin/pending' : role === 'worker' ? '/jobs' : '/complaints';
  const allowed = c && (role === 'admin' || (role === 'worker' ? c.assignedWorkerId === me!.id : c.requesterId === me!.id));
  if (!c || !allowed) return <div className="card"><EmptyState title="Complaint not available" text="It may not exist, or it is not assigned to you." action={<Link to={back} className="btn-secondary">Go back</Link>} /></div>;

  const appt = activeAppt(db, c.id);
  const requester = db.users.find((u) => u.id === c.requesterId);
  return (
    <div>
      <Link to={back} className="mb-3 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"><ArrowLeft size={14} /> Back to list</Link>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-slate-800">{c.id}</h1>
        <StatusBadge status={c.status} />
        {role !== 'student' && role !== 'faculty' ? <PriorityBadge priority={c.priority} /> : c.status !== 'pending_review' && c.status !== 'rejected' && <PriorityBadge priority={c.priority} />}
        {isOverdue(c) && <OverdueBadge days={daysOverdue(c)} />}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="card">
            <div className="card-title">Complaint details</div>
            <dl className="px-4 py-2">
              <InfoRow label="Category">{c.category}</InfoRow>
              <InfoRow label="Hostel / location">{c.location}</InfoRow>
              <InfoRow label="Room / spot">{c.room}</InfoRow>
              {role !== 'student' && role !== 'faculty' && <InfoRow label="Raised by">{requester?.name} ({requester?.identifier}){role === 'admin' && <span className="text-slate-500"> · {requester?.phone}</span>}</InfoRow>}
              <InfoRow label="Submitted">{fmtDateTime(c.submittedAt)}</InfoRow>
              {(role === 'admin' || c.status !== 'pending_review') && c.status !== 'rejected' && <InfoRow label="Target resolution">{fmtDate(dueDate(c).toISOString())}</InfoRow>}
              <InfoRow label="Assigned worker">{c.assignedWorkerId ? userName(db.users, c.assignedWorkerId) : <span className="text-slate-400">Not assigned</span>}</InfoRow>
              <InfoRow label="Appointment">{appt ? `${fmtDate(appt.date)}, ${fmtRange(appt.time)}` : <span className="text-slate-400">Not booked</span>}</InfoRow>
              {c.adminRemarks && <InfoRow label="Admin remarks">{c.adminRemarks}</InfoRow>}
              <InfoRow label="Description"><span className="whitespace-pre-wrap">{c.description}</span></InfoRow>
              <InfoRow label="Photos">
                {c.photos.length === 0 ? <span className="text-slate-400">No photos attached</span> : (
                  <div className="flex flex-wrap gap-2">{c.photos.map((p, i) => <button key={i} onClick={() => setPhoto(p)} aria-label={`View photo ${i + 1}`}><img src={p} alt={`Attachment ${i + 1}`} className="h-20 w-28 rounded border border-slate-200 object-cover hover:opacity-80" /></button>)}</div>
                )}
              </InfoRow>
            </dl>
          </div>
          {role === 'admin' ? <AdminPanel c={c} /> : role === 'worker' ? <WorkerPanel c={c} /> : <RequesterPanel c={c} />}
          {c.workNotes.length > 0 && (
            <div className="card">
              <div className="card-title">Work notes</div>
              <ul className="divide-y divide-slate-100">
                {c.workNotes.map((n) => <li key={n.id} className="px-4 py-2.5 text-sm"><p>{n.text}</p><p className="mt-0.5 text-xs text-slate-500">{userName(db.users, n.authorId)} · {fmtDateTime(n.at)}</p></li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="card self-start">
          <div className="card-title">Activity timeline</div>
          <div className="p-4"><Timeline events={c.timeline} /></div>
        </div>
      </div>
      <Modal open={!!photo} title="Attachment" wide onClose={() => setPhoto(null)}>{photo && <img src={photo} alt="Complaint attachment" className="max-h-[70vh] w-full rounded object-contain" />}</Modal>
    </div>
  );
}
