import { useState } from 'react';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { Complaint } from '../../types';
import { useApp } from '../../store/AppContext';
import { activeAppt, fmtDate, fmtRange, userName } from '../../utils/format';
import { ConfirmDialog } from '../ui/Modal';
import { Field } from '../ui/Common';

export default function WorkerPanel({ c }: { c: Complaint }) {
  const { db, updateJobStatus, addWorkNote, toast } = useApp();
  const [dlg, setDlg] = useState<'start' | 'done' | null>(null);
  const [text, setText] = useState('');
  const appt = activeAppt(db, c.id);
  const close = () => { setDlg(null); setText(''); };
  const phone = db.users.find((u) => u.id === c.requesterId)?.phone;

  return (
    <div className="card">
      <div className="card-title">Job actions</div>
      <div className="space-y-3 p-4">
        {appt && <p className="rounded bg-indigo-50 p-2 text-sm text-indigo-900">Scheduled: <b>{fmtDate(appt.date)}, {fmtRange(appt.time)}</b> at {c.location}, {c.room}. Contact {userName(db.users, c.requesterId)}: {phone}</p>}
        {c.status === 'scheduled' && <button className="btn-primary" onClick={() => setDlg('start')}><PlayCircle size={16} /> Start work</button>}
        {c.status === 'in_progress' && (
          <>
            <Field label="Add a work note"><textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Part ordered, will complete tomorrow" /></Field>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" disabled={!text.trim()} onClick={() => { addWorkNote(c.id, text.trim()); setText(''); toast('Work note added.'); }}>Save note</button>
              <button className="btn-success" onClick={() => { setText(''); setDlg('done'); }}><CheckCircle2 size={16} /> Mark completed</button>
            </div>
          </>
        )}
        {c.status === 'work_completed' && <p className="text-sm text-teal-800">Marked as completed. Waiting for the requester to confirm.</p>}
        {c.status === 'closed' && <p className="text-sm text-green-800">Closed. The requester confirmed the repair.</p>}
        {c.status === 'approved' && <p className="text-sm text-slate-600">Waiting for the requester to book a slot.</p>}
      </div>
      <ConfirmDialog open={dlg === 'start'} title="Start work" confirmLabel="Start work" onCancel={close} message="Mark this job as in progress? The requester will be notified."
        onConfirm={() => { updateJobStatus(c.id, 'in_progress'); toast('Job marked in progress.'); close(); }} />
      <ConfirmDialog open={dlg === 'done'} title="Mark work completed" confirmLabel="Mark completed" disabled={!text.trim()} onCancel={close}
        onConfirm={() => { updateJobStatus(c.id, 'work_completed', text.trim()); toast('Job marked completed.'); close(); }}>
        <Field label="Completion note" required hint="Describe what was done. This is shown to the requester."><textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} /></Field>
      </ConfirmDialog>
    </div>
  );
}
