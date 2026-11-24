import { useEffect, useMemo, useState } from 'react';
import { CalendarX } from 'lucide-react';
import { Slot, User } from '../../types';
import { fmtDay, fmtRange } from '../../utils/format';

const same = (a: Slot | null, b: Slot) => !!a && a.date === b.date && a.time === b.time && a.workerId === b.workerId;

export function SlotSelector({ slots, users, value, onChange }: { slots: Slot[]; users: User[]; value: Slot | null; onChange: (s: Slot) => void }) {
  const dates = useMemo(() => [...new Set(slots.map((s) => s.date))], [slots]);
  const [date, setDate] = useState(dates[0]);
  useEffect(() => { if (!dates.includes(date)) setDate(dates[0]); }, [dates, date]);

  if (slots.length === 0)
    return (
      <div className="flex items-center gap-2 rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        <CalendarX size={18} /> No technician slots are open in the next 10 days. Please check again later.
      </div>
    );
  const day = slots.filter((s) => s.date === date).sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Select date">
        {dates.map((d) => (
          <button key={d} role="tab" aria-selected={d === date} onClick={() => setDate(d)}
            className={`rounded border px-3 py-1.5 text-sm ${d === date ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
            {fmtDay(d)}
            <span className={`ml-1.5 text-xs ${d === date ? 'text-blue-100' : 'text-slate-500'}`}>({slots.filter((s) => s.date === d).length})</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {day.map((s) => {
          const sel = same(value, s);
          return (
            <button key={`${s.time}-${s.workerId}`} onClick={() => onChange(s)} aria-pressed={sel}
              className={`rounded border px-3 py-2 text-left text-sm ${sel ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700' : 'border-slate-300 bg-white hover:border-blue-400'}`}>
              <span className="block font-medium text-slate-800">{fmtRange(s.time)}</span>
              <span className="block text-xs text-slate-500">{users.find((u) => u.id === s.workerId)?.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
