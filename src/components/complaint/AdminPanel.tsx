import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Complaint, PRIORITIES, Priority } from '../../types';
import { useApp } from '../../store/AppContext';
import { activeAppt, fmtDate, fmtRange } from '../../utils/format';
import { ConfirmDialog } from '../ui/Modal';
import { Field } from '../ui/Common';

const PRESETS = ['Not a maintenance issue.', 'Duplicate of an existing complaint.', 'Insufficient details. Please resubmit with a clear description and photo.', 'Handled under the annual maintenance schedule.'];

export default function AdminPanel({ c }: { c: Complaint }) {
  const { db, approveComplaint, rejectComplaint, setPriority, assignWorker, toast } = useApp();
  const [pr, setPr] = useState<Priority>(c.priority);
  const [wk, setWk] = useState(c.assignedWorkerId ?? '');
  const [remarks, setRemarks] = useState('');
  const [dlg, setDlg] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const appt = activeAppt(db, c.id);
  const eligible = db.users.filter((u) => u.role === 'worker' && u.skills?.includes(c.category));
  const wName = (id: string) => db.users.find((u) => u.id === id)?.name;
  const close = () => { setDlg(null); setReason(''); };

  if (c.status === 'pending_review')
    return (
      <div className="card">
        <div className="card-title">Review decision</div>
        <div className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Priority"><select className="input capitalize" value={pr} onChange={(e) => setPr(e.target.value as Priority)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Pre-assign worker (optional)" hint="Limits slots to this worker when the user books.">
              <select className="input" value={wk} onChange={(e) => setWk(e.target.value)}>
                <option value="">Let user choose any available worker</option>
                {eligible.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Remarks to user (optional)"><textarea className="input" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
          <div className="flex flex-wrap gap-2">
            <button className="btn-success" onClick={() => setDlg('approve')}><Check size={16} /> Approve</button>
            <button className="btn-danger" onClick={() => setDlg('reject')}><X size={16} /> Reject</button>
          </div>
        </div>
        <ConfirmDialog open={dlg === 'approve'} title="Approve complaint" confirmLabel="Approve" onCancel={close}
          message={<>Approve <b>{c.id}</b> with <b className="capitalize">{pr}</b> priority{wk ? <> and assign <b>{wName(wk)}</b></> : ''}? The user will be asked to book a slot.</>}
          onConfirm={() => { approveComplaint(c.id, { priority: pr, workerId: wk || undefined, remarks: remarks.trim() || undefined }); toast('Complaint approved.'); close(); }} />
        <ConfirmDialog open={dlg === 'reject'} title="Reject complaint" danger confirmLabel="Reject" disabled={reason.trim().length < 5} onCancel={close}
          onConfirm={() => { rejectComplaint(c.id, reason.trim()); toast('Complaint rejected.', 'info'); close(); }}>
          <div className="space-y-2">
            <Field label="Reason (shown to the user)" required><textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <div className="flex flex-wrap gap-1.5">{PRESETS.map((p) => <button key={p} type="button" className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" onClick={() => setReason(p)}>{p.split('.')[0]}</button>)}</div>
          </div>
        </ConfirmDialog>
      </div>
    );

  if (c.status === 'rejected') return <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p className="font-semibold">Rejected</p><p className="mt-1">{c.rejectionReason}</p></div>;
  if (c.status === 'closed') return <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-900">This complaint is closed. {c.feedback && <>User feedback: “{c.feedback}”</>}</div>;

  const locked = c.status === 'work_completed';
  return (
    <div className="card">
      <div className="card-title">Manage complaint</div>
      <div className="space-y-3 p-4">
        {c.status === 'approved' && <p className="rounded bg-blue-50 p-2 text-sm text-blue-900">Approved. Waiting for the user to book a slot.</p>}
        {appt && <p className="rounded bg-indigo-50 p-2 text-sm text-indigo-900">Visit booked: <b>{fmtDate(appt.date)}, {fmtRange(appt.time)}</b> with {wName(appt.workerId)}.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Priority">
            <select className="input capitalize" value={c.priority} onChange={(e) => { setPriority(c.id, e.target.value as Priority); toast('Priority updated.'); }}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Assigned worker">
            <select className="input" disabled={locked} value={c.assignedWorkerId ?? ''} onChange={(e) => { if (!e.target.value) return; const err = assignWorker(c.id, e.target.value); err ? toast(err, 'error') : toast('Worker assigned.'); }}>
              <option value="">{c.assignedWorkerId ? '' : 'Not assigned'}</option>
              {eligible.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}
