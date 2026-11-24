import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { ComplaintTable } from '../../components/complaint/ComplaintTable';
import { PageHeader } from '../../components/ui/Common';
import { Complaint } from '../../types';
import { activeAppt, lastAppt, todayStr } from '../../utils/format';

const TABS = ['assigned', 'today', 'upcoming', 'completed'] as const;
type Tab = (typeof TABS)[number];
const LABEL: Record<Tab, string> = { assigned: 'All assigned', today: "Today's appointments", upcoming: 'Upcoming', completed: 'Completed' };

export default function Jobs() {
  const { db, me } = useApp();
  const [sp, setSp] = useSearchParams();
  const tab: Tab = (TABS as readonly string[]).includes(sp.get('tab') ?? '') ? (sp.get('tab') as Tab) : 'assigned';
  const today = todayStr();
  const mine = db.complaints.filter((c) => c.assignedWorkerId === me!.id);
  const date = (c: Complaint) => (activeAppt(db, c.id) ?? lastAppt(db, c.id))?.date ?? '';
  const filters: Record<Tab, (c: Complaint) => boolean> = {
    assigned: (c) => c.status !== 'closed',
    today: (c) => date(c) === today && ['scheduled', 'in_progress'].includes(c.status),
    upcoming: (c) => date(c) > today && c.status === 'scheduled',
    completed: (c) => c.status === 'work_completed' || c.status === 'closed',
  };
  const rows = mine.filter(filters[tab]).sort((a, b) => date(a).localeCompare(date(b)));
  return (
    <div>
      <PageHeader title="My Jobs" subtitle="Open a job to update progress and add work notes." />
      <div className="mb-3 flex flex-wrap gap-1 border-b border-slate-300" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={t === tab} onClick={() => setSp(t === 'assigned' ? {} : { tab: t })}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${t === tab ? 'border-blue-700 font-medium text-blue-800' : 'border-transparent text-slate-600 hover:text-slate-800'}`}>
            {LABEL[t]} <span className="text-xs text-slate-500">({mine.filter(filters[t]).length})</span>
          </button>
        ))}
      </div>
      <ComplaintTable complaints={rows} showRequester showPriority showWorker={false} emptyTitle={`No jobs in “${LABEL[tab]}”`} />
    </div>
  );
}
