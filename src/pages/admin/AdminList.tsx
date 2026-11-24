import { Navigate, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { ComplaintTable } from '../../components/complaint/ComplaintTable';
import { PageHeader } from '../../components/ui/Common';
import { Complaint } from '../../types';
import { isOverdue } from '../../utils/format';

const LISTS: Record<string, { title: string; sub: string; filter: (c: Complaint) => boolean; status?: boolean }> = {
  pending: { title: 'Pending Review', sub: 'Complaints waiting for approval or rejection.', filter: (c) => c.status === 'pending_review', status: false },
  approved: { title: 'Approved Complaints', sub: 'Approved complaints that are waiting for the user to book a slot.', filter: (c) => c.status === 'approved', status: false },
  rejected: { title: 'Rejected Complaints', sub: 'Complaints rejected with a reason.', filter: (c) => c.status === 'rejected', status: false },
  overdue: { title: 'Overdue Complaints', sub: 'Open complaints past their target resolution time (urgent 1 day, high 3, medium 5, low 7).', filter: isOverdue },
  all: { title: 'All Complaints', sub: 'Every complaint in the system.', filter: () => true },
};

export default function AdminList() {
  const { list } = useParams();
  const { db } = useApp();
  const cfg = list ? LISTS[list] : undefined;
  if (!cfg) return <Navigate to="/" replace />;
  const rows = db.complaints.filter(cfg.filter).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt) * (list === 'all' ? -1 : 1));
  return (
    <div>
      <PageHeader title={cfg.title} subtitle={cfg.sub} />
      <ComplaintTable complaints={rows} showRequester showPriority statusFilter={cfg.status !== false} emptyTitle={`No ${cfg.title.toLowerCase()}`} />
    </div>
  );
}
