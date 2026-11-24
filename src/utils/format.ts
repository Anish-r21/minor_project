import { Appointment, Complaint, DB, Slot, SLA_DAYS, TIME_SLOTS, User, Category } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');
export const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());
export const addDays = (s: string, n: number) => {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateStr(d);
};
const parse = (s: string) => new Date(s.length === 10 ? s + 'T00:00:00' : s);
export const fmtDate = (s: string) => parse(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtDay = (s: string) => parse(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtDateTime = (s: string) =>
  parse(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const fmtRange = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${fmtTime(t)} – ${fmtTime(`${pad(h + 1)}:${pad(m)}`)}`;
};
export const isoAt = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
export const agoISO = (days: number) => new Date(Date.now() - days * 864e5).toISOString();

export const dueDate = (c: Complaint) => new Date(new Date(c.submittedAt).getTime() + SLA_DAYS[c.priority] * 864e5);
export const isOverdue = (c: Complaint) =>
  ['pending_review', 'approved', 'scheduled', 'in_progress'].includes(c.status) && dueDate(c).getTime() < Date.now();
export const daysOverdue = (c: Complaint) => Math.max(1, Math.floor((Date.now() - dueDate(c).getTime()) / 864e5));

export const activeAppt = (db: DB, complaintId: string): Appointment | undefined =>
  db.appointments.find((a) => a.complaintId === complaintId && a.status === 'booked');
export const lastAppt = (db: DB, complaintId: string): Appointment | undefined =>
  [...db.appointments].reverse().find((a) => a.complaintId === complaintId && a.status !== 'cancelled');
export const userName = (users: User[], id?: string) => users.find((u) => u.id === id)?.name ?? '—';

/** Available technician slots for the next N days, derived from worker availability + existing bookings. */
export function generateSlots(
  users: User[],
  appts: Appointment[],
  category: Category,
  opts: { workerId?: string; ignoreApptId?: string; days?: number } = {}
): Slot[] {
  const workers = users.filter((u) => u.role === 'worker' && u.skills?.includes(category) && (!opts.workerId || u.id === opts.workerId));
  const out: Slot[] = [];
  const today = todayStr();
  for (let i = 1; i <= (opts.days ?? 10); i++) {
    const date = addDays(today, i);
    const dow = new Date(date + 'T00:00:00').getDay();
    for (const w of workers) {
      if (!w.availableDays?.includes(dow) || w.leaveDates?.includes(date)) continue;
      for (const time of TIME_SLOTS) {
        const taken = appts.some((a) => a.status === 'booked' && a.id !== opts.ignoreApptId && a.workerId === w.id && a.date === date && a.time === time);
        if (!taken) out.push({ date, time, workerId: w.id });
      }
    }
  }
  return out;
}

export const placeholderPhoto = (label: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><rect width='320' height='220' fill='#e2e8f0'/><rect x='110' y='60' width='100' height='70' rx='8' fill='none' stroke='#94a3b8' stroke-width='5'/><circle cx='160' cy='95' r='18' fill='none' stroke='#94a3b8' stroke-width='5'/><text x='160' y='170' font-size='15' text-anchor='middle' fill='#64748b' font-family='Arial'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
