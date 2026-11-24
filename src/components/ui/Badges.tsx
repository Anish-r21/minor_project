import { Priority, Status, STATUS_LABEL } from '../../types';

const STATUS_CLS: Record<Status, string> = {
  pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  scheduled: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  in_progress: 'bg-sky-100 text-sky-800 border-sky-200',
  work_completed: 'bg-teal-100 text-teal-800 border-teal-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
};
const PRIORITY_CLS: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};
const base = 'inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium';

export const StatusBadge = ({ status }: { status: Status }) => <span className={`${base} ${STATUS_CLS[status]}`}>{STATUS_LABEL[status]}</span>;
export const PriorityBadge = ({ priority }: { priority: Priority }) => <span className={`${base} capitalize ${PRIORITY_CLS[priority]}`}>{priority}</span>;
export const OverdueBadge = ({ days }: { days?: number }) => <span className={`${base} border-red-300 bg-red-600 text-white`}>Overdue{days ? ` ${days}d` : ''}</span>;
