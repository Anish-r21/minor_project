import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Appointment, Category, Complaint, DB, EventKind, Notification, Priority, Slot, Status, TimelineEvent, User } from '../types';
import { buildMockDB } from '../data/mock';
import { fmtDate, fmtTime, userName } from '../utils/format';

const KEY = 'campus-maintenance-phase1-v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();
const evt = (actor: string, kind: EventKind, action: string, detail?: string): TimelineEvent => ({ id: uid(), at: nowISO(), actor, kind, action, detail });
const note = (userId: string, title: string, message: string, complaintId?: string): Notification => ({ id: uid(), userId, title, message, complaintId, createdAt: nowISO(), read: false });

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* ignore */ }
  return buildMockDB();
}

export interface Toast { id: string; text: string; type: 'success' | 'error' | 'info' }

interface Ctx {
  db: DB;
  me: User | null;
  toasts: Toast[];
  toast: (text: string, type?: Toast['type']) => void;
  login: (userId: string) => void;
  logout: () => void;
  resetDemo: () => void;
  submitComplaint: (i: { category: Category; location: string; room: string; description: string; photos: string[] }) => string;
  approveComplaint: (id: string, o: { priority: Priority; workerId?: string; remarks?: string }) => void;
  rejectComplaint: (id: string, reason: string) => void;
  setPriority: (id: string, p: Priority) => void;
  assignWorker: (id: string, workerId: string) => string | null;
  bookSlot: (id: string, slot: Slot) => string | null;
  rescheduleAppointment: (id: string, slot: Slot, reason: string) => string | null;
  cancelAppointment: (id: string, reason: string) => void;
  updateJobStatus: (id: string, status: 'in_progress' | 'work_completed', text?: string) => void;
  addWorkNote: (id: string, text: string) => void;
  confirmResolution: (id: string, resolved: boolean, text?: string) => void;
  toggleWorkerDay: (workerId: string, day: number) => void;
  addLeave: (workerId: string, date: string) => void;
  removeLeave: (workerId: string, date: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  updatePhone: (phone: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ref = useRef(db);
  ref.current = db;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full (e.g. large photos) */ }
  }, [db]);

  const me = db.users.find((u) => u.id === db.currentUserId) ?? null;
  const toast = useCallback((text: string, type: Toast['type'] = 'success') => {
    const id = uid();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const cur = () => ref.current;
  const meNow = () => cur().users.find((u) => u.id === cur().currentUserId)!;
  const admins = () => cur().users.filter((u) => u.role === 'admin');
  const name = (id?: string) => userName(cur().users, id);
  const apply = (id: string, fn: (c: Complaint) => Complaint, extra: Notification[] = [], apptFn?: (a: Appointment[]) => Appointment[]) =>
    setDb((p) => ({
      ...p,
      complaints: p.complaints.map((c) => (c.id === id ? fn(c) : c)),
      appointments: apptFn ? apptFn(p.appointments) : p.appointments,
      notifications: [...extra, ...p.notifications],
    }));
  const getC = (id: string) => cur().complaints.find((c) => c.id === id)!;
  const slotTaken = (s: Slot, ignore?: string) =>
    cur().appointments.some((a) => a.status === 'booked' && a.id !== ignore && a.workerId === s.workerId && a.date === s.date && a.time === s.time);

  const value: Ctx = {
    db, me, toasts, toast,
    login: (userId) => setDb((p) => ({ ...p, currentUserId: userId })),
    logout: () => setDb((p) => ({ ...p, currentUserId: null })),
    resetDemo: () => { const fresh = buildMockDB(); setDb({ ...fresh, currentUserId: cur().currentUserId }); toast('Demo data reset.', 'info'); },

    submitComplaint: (i) => {
      const u = meNow();
      const id = `CMP-2026-${String(cur().complaints.length + 1).padStart(4, '0')}`;
      const c: Complaint = { id, ...i, requesterId: u.id, submittedAt: nowISO(), status: 'pending_review', priority: 'medium', timeline: [evt(u.name, 'submitted', 'Complaint submitted')], workNotes: [] };
      setDb((p) => ({
        ...p,
        complaints: [c, ...p.complaints],
        notifications: [
          note(u.id, 'Complaint submitted', `${id} has been sent for admin review.`, id),
          ...admins().map((a) => note(a.id, 'New complaint awaiting review', `${id} – ${i.category} at ${i.location}.`, id)),
          ...p.notifications,
        ],
      }));
      return id;
    },

    approveComplaint: (id, o) => {
      const c = getC(id); const a = meNow();
      const extra = [note(c.requesterId, 'Complaint approved', `${id} was approved. Book a technician slot.`, id)];
      if (o.workerId) extra.push(note(o.workerId, 'Complaint pre-assigned', `${id} was assigned to you. Awaiting the requester to book a slot.`, id));
      apply(id, (x) => ({
        ...x, status: 'approved' as Status, priority: o.priority, assignedWorkerId: o.workerId, adminRemarks: o.remarks,
        timeline: [...x.timeline,
          evt(a.name, 'approved', 'Complaint approved', `Priority set to ${o.priority}.${o.remarks ? ' ' + o.remarks : ''}`),
          ...(o.workerId ? [evt(a.name, 'assigned', `Worker assigned: ${name(o.workerId)}`)] : [])],
      }), extra);
    },

    rejectComplaint: (id, reason) => {
      const c = getC(id); const a = meNow();
      apply(id, (x) => ({ ...x, status: 'rejected', rejectionReason: reason, timeline: [...x.timeline, evt(a.name, 'rejected', 'Complaint rejected', reason)] }),
        [note(c.requesterId, 'Complaint rejected', `${id} was rejected. Open the complaint to see the reason.`, id)]);
    },

    setPriority: (id, p) => {
      const a = meNow();
      apply(id, (x) => ({ ...x, priority: p, timeline: [...x.timeline, evt(a.name, 'priority', `Priority changed to ${p}`)] }),
        [note(getC(id).requesterId, 'Priority updated', `${id} priority is now ${p}.`, id)]);
    },

    assignWorker: (id, workerId) => {
      const c = getC(id); const a = meNow();
      const appt = cur().appointments.find((x) => x.complaintId === id && x.status === 'booked');
      if (appt && slotTaken({ date: appt.date, time: appt.time, workerId }, appt.id)) return `${name(workerId)} already has a visit at that time.`;
      const extra = [note(workerId, 'Job assigned', `${id} at ${c.location} ${c.room}${appt ? ` on ${fmtDate(appt.date)}, ${fmtTime(appt.time)}` : ''}.`, id), note(c.requesterId, 'Worker assigned', `${name(workerId)} is assigned to ${id}.`, id)];
      if (appt && appt.workerId !== workerId) extra.push(note(appt.workerId, 'Job reassigned', `${id} was reassigned to another worker.`, id));
      apply(id, (x) => ({ ...x, assignedWorkerId: workerId, timeline: [...x.timeline, evt(a.name, 'assigned', `Worker assigned: ${name(workerId)}`)] }), extra,
        appt ? (list) => list.map((x) => (x.id === appt.id ? { ...x, workerId } : x)) : undefined);
      return null;
    },

    bookSlot: (id, slot) => {
      if (slotTaken(slot)) return 'That slot was just taken. Please pick another.';
      const c = getC(id); const u = meNow();
      const appt: Appointment = { id: uid(), complaintId: id, workerId: slot.workerId, date: slot.date, time: slot.time, status: 'booked' };
      const when = `${fmtDate(slot.date)} at ${fmtTime(slot.time)}`;
      apply(id, (x) => ({ ...x, status: 'scheduled', assignedWorkerId: slot.workerId, timeline: [...x.timeline, evt(u.name, 'scheduled', 'Appointment booked', `${when} with ${name(slot.workerId)}.`)] }),
        [note(u.id, 'Appointment booked', `${id}: visit on ${when} with ${name(slot.workerId)}.`, id),
         note(slot.workerId, 'New appointment assigned', `${id} at ${c.location} ${c.room} on ${when}.`, id),
         ...admins().map((a) => note(a.id, 'Visit scheduled', `${id} booked for ${when}.`, id))],
        (l) => [...l, appt]);
      return null;
    },

    rescheduleAppointment: (id, slot, reason) => {
      const old = cur().appointments.find((a) => a.complaintId === id && a.status === 'booked');
      if (slotTaken(slot, old?.id)) return 'That slot was just taken. Please pick another.';
      const c = getC(id); const u = meNow();
      const appt: Appointment = { id: uid(), complaintId: id, workerId: slot.workerId, date: slot.date, time: slot.time, status: 'booked' };
      const when = `${fmtDate(slot.date)} at ${fmtTime(slot.time)}`;
      const extra = [note(u.id, 'Appointment changed', `${id} rescheduled to ${when}.`, id), note(slot.workerId, 'New appointment assigned', `${id} at ${c.location} ${c.room} on ${when}.`, id),
        ...admins().map((a) => note(a.id, 'Visit rescheduled', `${id} moved to ${when}. Reason: ${reason}`, id))];
      if (old && old.workerId !== slot.workerId) extra.push(note(old.workerId, 'Appointment cancelled', `${id} visit was rescheduled with another worker.`, id));
      apply(id, (x) => ({ ...x, assignedWorkerId: slot.workerId, timeline: [...x.timeline, evt(u.name, 'rescheduled', 'Appointment rescheduled', `New time: ${when} with ${name(slot.workerId)}. Reason: ${reason}`)] }), extra,
        (l) => [...l.map((a) => (a.id === old?.id ? { ...a, status: 'cancelled' as const } : a)), appt]);
      return null;
    },

    cancelAppointment: (id, reason) => {
      const old = cur().appointments.find((a) => a.complaintId === id && a.status === 'booked');
      const u = meNow();
      const extra = [note(u.id, 'Appointment cancelled', `${id}: your visit was cancelled. Book a new slot when ready.`, id), ...admins().map((a) => note(a.id, 'Visit cancelled', `${id}: ${reason}`, id))];
      if (old) extra.push(note(old.workerId, 'Appointment cancelled', `${id} visit was cancelled by the requester.`, id));
      apply(id, (x) => ({ ...x, status: 'approved', assignedWorkerId: undefined, timeline: [...x.timeline, evt(u.name, 'cancelled', 'Appointment cancelled', reason)] }), extra,
        (l) => l.map((a) => (a.id === old?.id ? { ...a, status: 'cancelled' as const } : a)));
    },

    updateJobStatus: (id, status, text) => {
      const c = getC(id); const w = meNow();
      const done = status === 'work_completed';
      const extra = [note(c.requesterId, done ? 'Work completed' : 'Work in progress', done ? `${id}: please confirm if the issue is resolved.` : `${w.name} has started work on ${id}.`, id),
        ...(done ? admins().map((a) => note(a.id, 'Work completed', `${w.name} marked ${id} as completed.`, id)) : [])];
      apply(id, (x) => ({
        ...x, status,
        workNotes: text ? [...x.workNotes, { id: uid(), at: nowISO(), authorId: w.id, text }] : x.workNotes,
        timeline: [...x.timeline, done ? evt(w.name, 'completed', 'Work completed', text) : evt(w.name, 'progress', 'Work started', text)],
      }), extra, done ? (l) => l.map((a) => (a.complaintId === id && a.status === 'booked' ? { ...a, status: 'completed' as const } : a)) : undefined);
    },

    addWorkNote: (id, text) => {
      const c = getC(id); const w = meNow();
      apply(id, (x) => ({ ...x, workNotes: [...x.workNotes, { id: uid(), at: nowISO(), authorId: w.id, text }], timeline: [...x.timeline, evt(w.name, 'note', 'Work note added', text)] }),
        [note(c.requesterId, 'Progress update', `${w.name} added an update on ${id}.`, id)]);
    },

    confirmResolution: (id, resolved, text) => {
      const c = getC(id); const u = meNow();
      const targets = [...admins().map((a) => a.id), ...(c.assignedWorkerId ? [c.assignedWorkerId] : [])];
      if (resolved) {
        apply(id, (x) => ({ ...x, status: 'closed', feedback: text, timeline: [...x.timeline, evt(u.name, 'closed', 'Resolution confirmed. Complaint closed.', text)] }),
          [note(u.id, 'Complaint closed', `${id} is closed. Thank you for confirming.`, id), ...targets.map((t) => note(t, 'Complaint resolved', `${id} was confirmed resolved by ${u.name}.`, id))]);
      } else {
        apply(id, (x) => ({ ...x, status: 'approved', priority: 'high', assignedWorkerId: undefined, feedback: text, timeline: [...x.timeline, evt(u.name, 'reopened', 'Reported as not resolved', text)] }),
          [note(u.id, 'Complaint reopened', `${id} is open again. Please book a new slot.`, id), ...targets.map((t) => note(t, 'Not resolved', `${u.name} reported ${id} is still not fixed.`, id))]);
      }
    },

    toggleWorkerDay: (workerId, day) =>
      setDb((p) => ({ ...p, users: p.users.map((u) => u.id !== workerId ? u : { ...u, availableDays: u.availableDays?.includes(day) ? u.availableDays.filter((d) => d !== day) : [...(u.availableDays ?? []), day].sort() }) })),
    addLeave: (workerId, date) =>
      setDb((p) => ({ ...p, users: p.users.map((u) => u.id !== workerId || u.leaveDates?.includes(date) ? u : { ...u, leaveDates: [...(u.leaveDates ?? []), date].sort() }) })),
    removeLeave: (workerId, date) =>
      setDb((p) => ({ ...p, users: p.users.map((u) => u.id !== workerId ? u : { ...u, leaveDates: (u.leaveDates ?? []).filter((d) => d !== date) }) })),

    markRead: (id) => setDb((p) => ({ ...p, notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    markAllRead: () => setDb((p) => ({ ...p, notifications: p.notifications.map((n) => (n.userId === p.currentUserId ? { ...n, read: true } : n)) })),
    updatePhone: (phone) => setDb((p) => ({ ...p, users: p.users.map((u) => (u.id === p.currentUserId ? { ...u, phone } : u)) })),
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
