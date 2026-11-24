import { useMemo, useState } from 'react';
import { CalendarCheck, CheckCircle2, ThumbsDown, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Complaint, Slot } from '../../types';
import { useApp } from '../../store/AppContext';
import { activeAppt, fmtDate, fmtRange, generateSlots, todayStr, userName } from '../../utils/format';
import { ConfirmDialog, Modal } from '../ui/Modal';
import { SlotSelector } from '../ui/SlotSelector';
import { Field } from '../ui/Common';

export default function RequesterPanel({ c }: { c: Complaint }) {
  const { db, bookSlot, rescheduleAppointment, cancelAppointment, confirmResolution, toast } = useApp();
  const appt = activeAppt(db, c.id);
  const slots = useMemo(() => generateSlots(db.users, db.appointments, c.category, { workerId: c.status === 'approved' ? c.assignedWorkerId : undefined, ignoreApptId: appt?.id }), [db.users, db.appointments, c, appt?.id]);
  const [sel, setSel] = useState<Slot | null>(null);
  const [dlg, setDlg] = useState<'book' | 'resched' | 'cancel' | 'yes' | 'no' | null>(null);
  const [text, setText] = useState('');
  const [just, setJust] = useState(false);
  const close = () => { setDlg(null); setText(''); };
  const worker = (id?: string) => db.users.find((u) => u.id === id);

  if (c.status === 'pending_review')
    return <Box tone="amber" title="Waiting for admin review">Your complaint is in the review queue. You will be notified once it is approved or rejected.</Box>;

  if (c.status === 'rejected')
    return (
      <Box tone="red" title="Complaint rejected" icon={<XCircle size={18} />}>
        <p className="font-medium">Reason from admin:</p>
        <p className="mt-1">{c.rejectionReason}</p>
        <Link to="/complaints/new" className="btn-secondary mt-3 inline-flex">Submit a new complaint</Link>
      </Box>
    );

  if (c.status === 'approved')
    return (
      <div className="card">
        <div className="card-title">Book an appointment</div>
        <div className="space-y-3 p-4">
          <p className="text-sm text-slate-600">
            {c.feedback ? 'This complaint was reopened. ' : 'Your complaint was approved. '}
            Choose a convenient slot for the technician visit.
            {c.assignedWorkerId && <> Admin has assigned <b>{userName(db.users, c.assignedWorkerId)}</b> to this job.</>}
          </p>
          <SlotSelector slots={slots} users={db.users} value={sel} onChange={setSel} />
          <button className="btn-primary" disabled={!sel} onClick={() => setDlg('book')}><CalendarCheck size={16} /> Book selected slot</button>
        </div>
        <ConfirmDialog open={dlg === 'book'} title="Confirm booking" confirmLabel="Confirm booking" onCancel={close}
          message={sel && <>Book <b>{fmtDate(sel.date)}</b>, <b>{fmtRange(sel.time)}</b> with <b>{userName(db.users, sel.workerId)}</b>?</>}
          onConfirm={() => { const e = sel && bookSlot(c.id, sel); if (e) toast(e, 'error'); else { toast('Appointment booked.'); setJust(true); } setSel(null); close(); }} />
      </div>
    );

  if (c.status === 'scheduled' && appt) {
    const w = worker(appt.workerId);
    const canChange = appt.date > todayStr();
    return (
      <div className="card">
        <div className="card-title">Your appointment</div>
        <div className="space-y-3 p-4">
          {just && <p className="flex items-center gap-2 rounded bg-green-50 p-2 text-sm text-green-800"><CheckCircle2 size={16} /> Booking confirmed. The technician has been notified.</p>}
          <div className="rounded border border-indigo-200 bg-indigo-50 p-3 text-sm">
            <p className="font-semibold text-indigo-900">{fmtDate(appt.date)} · {fmtRange(appt.time)}</p>
            <p className="text-indigo-800">Technician: {w?.name} ({w?.phone})</p>
            <p className="text-indigo-800">Please make sure someone is available at {c.location}, {c.room}.</p>
          </div>
          {canChange ? (
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => { setSel(null); setDlg('resched'); }}>Request reschedule</button>
              <button className="btn-secondary text-red-700" onClick={() => setDlg('cancel')}>Cancel appointment</button>
            </div>
          ) : <p className="text-xs text-slate-500">Appointments can be changed only until the day before the visit.</p>}
        </div>
        <Modal open={dlg === 'resched'} title="Reschedule appointment" wide onClose={close}
          footer={<><button className="btn-secondary" onClick={close}>Cancel</button>
            <button className="btn-primary" disabled={!sel || !text.trim()} onClick={() => { const e = sel && rescheduleAppointment(c.id, sel, text.trim()); if (e) toast(e, 'error'); else toast('Appointment rescheduled.'); setSel(null); close(); }}>Confirm new slot</button></>}>
          <div className="space-y-3">
            <Field label="Reason for rescheduling" required><textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} /></Field>
            <SlotSelector slots={slots} users={db.users} value={sel} onChange={setSel} />
          </div>
        </Modal>
        <ConfirmDialog open={dlg === 'cancel'} title="Cancel appointment" danger confirmLabel="Cancel appointment" disabled={!text.trim()} onCancel={close}
          message="The slot will be released and you can book a new one later."
          onConfirm={() => { cancelAppointment(c.id, text.trim()); toast('Appointment cancelled.', 'info'); close(); }}>
          <div className="mt-3"><Field label="Reason" required><textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} /></Field></div>
        </ConfirmDialog>
      </div>
    );
  }

  if (c.status === 'in_progress') return <Box tone="blue" title="Work in progress">The technician has started work. You will be notified when the job is completed.</Box>;

  if (c.status === 'work_completed')
    return (
      <div className="card">
        <div className="card-title">Confirm resolution</div>
        <div className="space-y-3 p-4">
          <p className="text-sm text-slate-600">The technician has marked this job as completed. Was the problem fixed?</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-success" onClick={() => setDlg('yes')}><CheckCircle2 size={16} /> Yes, resolved</button>
            <button className="btn-secondary text-red-700" onClick={() => setDlg('no')}><ThumbsDown size={16} /> Not resolved</button>
          </div>
        </div>
        <ConfirmDialog open={dlg === 'yes'} title="Close complaint" confirmLabel="Close complaint" onCancel={close}
          message="Confirm that the issue is fixed. The complaint will be closed."
          onConfirm={() => { confirmResolution(c.id, true, text.trim() || undefined); toast('Complaint closed.'); close(); }}>
          <div className="mt-3"><Field label="Feedback (optional)"><textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} /></Field></div>
        </ConfirmDialog>
        <ConfirmDialog open={dlg === 'no'} title="Report as not resolved" danger confirmLabel="Reopen complaint" disabled={!text.trim()} onCancel={close}
          message="The complaint will be reopened with high priority. You can then book a new slot."
          onConfirm={() => { confirmResolution(c.id, false, text.trim()); toast('Complaint reopened. Please book a new slot.', 'info'); close(); }}>
          <div className="mt-3"><Field label="What is still wrong?" required><textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} /></Field></div>
        </ConfirmDialog>
      </div>
    );

  return <Box tone="green" title="Complaint closed" icon={<CheckCircle2 size={18} />}>You confirmed this issue was resolved.{c.feedback && <> Your feedback: “{c.feedback}”</>}</Box>;
}

function Box({ tone, title, children, icon }: { tone: 'amber' | 'red' | 'blue' | 'green'; title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  const cls = { amber: 'border-amber-200 bg-amber-50 text-amber-900', red: 'border-red-200 bg-red-50 text-red-900', blue: 'border-blue-200 bg-blue-50 text-blue-900', green: 'border-green-200 bg-green-50 text-green-900' };
  return <div className={`rounded border p-4 text-sm ${cls[tone]}`}><p className="mb-1 flex items-center gap-2 font-semibold">{icon}{title}</p><div>{children}</div></div>;
}
