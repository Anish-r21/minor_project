import { AlertCircle, CheckCircle2, CircleDot, CalendarCheck, CalendarClock, FilePlus, Flag, MessageSquare, PlayCircle, RotateCcw, ThumbsUp, UserCheck, XCircle } from 'lucide-react';
import { EventKind, TimelineEvent } from '../../types';
import { fmtDateTime } from '../../utils/format';

const ICON: Record<EventKind, { icon: typeof CircleDot; cls: string }> = {
  submitted: { icon: FilePlus, cls: 'text-blue-600 bg-blue-50' },
  approved: { icon: ThumbsUp, cls: 'text-green-600 bg-green-50' },
  rejected: { icon: XCircle, cls: 'text-red-600 bg-red-50' },
  assigned: { icon: UserCheck, cls: 'text-indigo-600 bg-indigo-50' },
  priority: { icon: Flag, cls: 'text-orange-600 bg-orange-50' },
  scheduled: { icon: CalendarCheck, cls: 'text-indigo-600 bg-indigo-50' },
  rescheduled: { icon: CalendarClock, cls: 'text-amber-600 bg-amber-50' },
  cancelled: { icon: AlertCircle, cls: 'text-red-600 bg-red-50' },
  progress: { icon: PlayCircle, cls: 'text-sky-600 bg-sky-50' },
  note: { icon: MessageSquare, cls: 'text-slate-600 bg-slate-100' },
  completed: { icon: CheckCircle2, cls: 'text-teal-600 bg-teal-50' },
  closed: { icon: CheckCircle2, cls: 'text-green-700 bg-green-50' },
  reopened: { icon: RotateCcw, cls: 'text-orange-600 bg-orange-50' },
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <ol className="space-y-0">
      {sorted.map((e, i) => {
        const { icon: Icon, cls } = ICON[e.kind];
        return (
          <li key={e.id} className="relative flex gap-3 pb-4">
            {i < sorted.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200" />}
            <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon size={16} /></span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium text-slate-800">{e.action}</p>
              {e.detail && <p className="mt-0.5 break-words text-sm text-slate-600">{e.detail}</p>}
              <p className="mt-0.5 text-xs text-slate-500">{e.actor} · {fmtDateTime(e.at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
