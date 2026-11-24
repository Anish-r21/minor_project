import { Appointment, Category, Complaint, DB, Notification, Priority, Status, TimelineEvent, User } from '../types';
import { agoISO, fmtDate, fmtTime, isoAt, placeholderPhoto, toDateStr } from '../utils/format';

const ALL = [1, 2, 3, 4, 5, 6];
const WEEK = [1, 2, 3, 4, 5];

export const USERS: User[] = [
  { id: 'u-stu1', name: 'Aarav Sharma', role: 'student', identifier: '23103045', email: 'aarav.sharma@nitj.ac.in', phone: '9876501234', department: 'Information Technology', hostel: 'BH-3', room: '214' },
  { id: 'u-stu2', name: 'Priya Verma', role: 'student', identifier: '23105012', email: 'priya.verma@nitj.ac.in', phone: '9815098150', department: 'Computer Science & Engineering', hostel: 'MGH', room: '108' },
  { id: 'u-stu3', name: 'Rohan Gupta', role: 'student', identifier: '22106033', email: 'rohan.gupta@nitj.ac.in', phone: '9988776655', department: 'Electronics & Communication', hostel: 'BH-5', room: '305' },
  { id: 'u-stu4', name: 'Simran Kaur', role: 'student', identifier: '24102019', email: 'simran.kaur@nitj.ac.in', phone: '9501234567', department: 'Civil Engineering', hostel: 'MGH', room: '412' },
  { id: 'u-fac1', name: 'Dr. Neha Malhotra', role: 'faculty', identifier: 'EMP-4521', email: 'neha.malhotra@nitj.ac.in', phone: '9417012345', department: 'Computer Science & Engineering', hostel: 'Faculty Residence', room: 'A-12' },
  { id: 'u-adm1', name: 'Rajesh Khanna', role: 'admin', identifier: 'EMP-1102', email: 'rajesh.khanna@nitj.ac.in', phone: '9417055501', department: 'Estate Section' },
  { id: 'u-adm2', name: 'Meena Chauhan', role: 'admin', identifier: 'EMP-1187', email: 'meena.chauhan@nitj.ac.in', phone: '9417055502', department: 'Hostel Office' },
  { id: 'u-w1', name: 'Ramesh Kumar', role: 'worker', identifier: 'W-201', email: 'ramesh.kumar@nitj.ac.in', phone: '9780011201', department: 'Electrical Wing', skills: ['Electrical'], availableDays: ALL, leaveDates: [] },
  { id: 'u-w2', name: 'Sukhdev Singh', role: 'worker', identifier: 'W-202', email: 'sukhdev.singh@nitj.ac.in', phone: '9780011202', department: 'Electrical Wing', skills: ['Electrical'], availableDays: WEEK, leaveDates: [] },
  { id: 'u-w3', name: 'Harpreet Singh', role: 'worker', identifier: 'W-203', email: 'harpreet.singh@nitj.ac.in', phone: '9780011203', department: 'Carpentry Unit', skills: ['Carpentry', 'Other'], availableDays: ALL, leaveDates: [] },
  { id: 'u-w4', name: 'Mohan Lal', role: 'worker', identifier: 'W-204', email: 'mohan.lal@nitj.ac.in', phone: '9780011204', department: 'Plumbing Unit', skills: ['Water Supply/Plumbing'], availableDays: ALL, leaveDates: [] },
  { id: 'u-w5', name: 'Amit Verma', role: 'worker', identifier: 'W-205', email: 'amit.verma@nitj.ac.in', phone: '9780011205', department: 'Computer Centre', skills: ['Internet'], availableDays: WEEK, leaveDates: [] },
  { id: 'u-w6', name: 'Balwinder Singh', role: 'worker', identifier: 'W-206', email: 'balwinder.singh@nitj.ac.in', phone: '9780011206', department: 'Civil Wing', skills: ['Masonry', 'Other'], availableDays: ALL, leaveDates: [] },
  { id: 'u-w7', name: 'Jaswant Singh', role: 'worker', identifier: 'W-207', email: 'jaswant.singh@nitj.ac.in', phone: '9780011207', department: 'Workshop', skills: ['Welding', 'Other'], availableDays: WEEK, leaveDates: [] },
];

interface Spec {
  by: string; cat: Category; loc: string; room: string; desc: string; ago: number; status: Status; pr: Priority;
  worker?: string; appt?: [number, string]; reason?: string; notes?: string[]; photos?: number; remarks?: string;
}

const SPECS: Spec[] = [
  { by: 'u-stu1', cat: 'Electrical', loc: 'BH-3', room: '214', desc: 'Ceiling fan makes a loud noise and wobbles at high speed. The regulator also seems faulty.', ago: 0.1, status: 'pending_review', pr: 'medium', photos: 1 },
  { by: 'u-stu1', cat: 'Water Supply/Plumbing', loc: 'BH-3', room: 'Washroom, 2nd floor', desc: 'Tap in the common washroom leaks continuously and water is being wasted.', ago: 1, status: 'approved', pr: 'high', photos: 2 },
  { by: 'u-stu1', cat: 'Carpentry', loc: 'BH-3', room: '214', desc: 'Study table drawer lock is broken and the window latch is loose.', ago: 3, status: 'scheduled', pr: 'medium', worker: 'u-w3', appt: [2, '10:00'], photos: 1 },
  { by: 'u-stu1', cat: 'Internet', loc: 'BH-3', room: '214', desc: 'LAN port in the room has not worked since last week. No wired connectivity.', ago: 5, status: 'work_completed', pr: 'medium', worker: 'u-w5', appt: [-1, '14:00'], notes: ['Replaced the faulty LAN socket and tested connectivity with a laptop. Port is working.'] },
  { by: 'u-stu1', cat: 'Masonry', loc: 'BH-3', room: '214', desc: 'Plaster is falling from the ceiling near the window.', ago: 14, status: 'closed', pr: 'high', worker: 'u-w6', appt: [-10, '11:00'], notes: ['Removed loose plaster and re-plastered the area.'] },
  { by: 'u-stu1', cat: 'Other', loc: 'BH-3', room: '214', desc: 'Request to repaint all walls of the room.', ago: 4, status: 'rejected', pr: 'low', reason: 'Room repainting is done once a year during the summer break as part of the hostel maintenance schedule. Please raise a complaint only for damage, seepage or leakage.' },
  { by: 'u-stu2', cat: 'Electrical', loc: 'MGH', room: '108', desc: 'Tube light flickers and the switch board sparks occasionally. Unsafe to use.', ago: 2, status: 'scheduled', pr: 'urgent', worker: 'u-w1', appt: [0, '11:00'], photos: 1 },
  { by: 'u-stu2', cat: 'Water Supply/Plumbing', loc: 'MGH', room: '108', desc: 'Geyser in the attached washroom is not heating water.', ago: 3, status: 'in_progress', pr: 'high', worker: 'u-w4', appt: [0, '09:00'], notes: ['Checked the geyser. Heating element is burnt out; replacement requested from store.'] },
  { by: 'u-stu3', cat: 'Welding', loc: 'BH-5', room: 'Common room', desc: 'Iron grill of the balcony door has broken at the hinge.', ago: 8, status: 'pending_review', pr: 'medium', photos: 2 },
  { by: 'u-stu3', cat: 'Carpentry', loc: 'BH-5', room: '305', desc: 'Cupboard door has come off its hinges.', ago: 7, status: 'approved', pr: 'high', worker: 'u-w3', remarks: 'Pre-assigned to Harpreet Singh.' },
  { by: 'u-stu3', cat: 'Internet', loc: 'BH-5', room: '3rd floor corridor', desc: 'Wi-Fi access point on the third floor corridor is down. No signal in rooms 301–310.', ago: 1, status: 'pending_review', pr: 'high' },
  { by: 'u-stu3', cat: 'Electrical', loc: 'BH-5', room: '305', desc: 'Switch board socket is loose and the plug does not stay in.', ago: 2, status: 'scheduled', pr: 'medium', worker: 'u-w1', appt: [3, '14:00'] },
  { by: 'u-stu3', cat: 'Electrical', loc: 'BH-5', room: 'Corridor', desc: 'Corridor light panel on the first floor is not working.', ago: 11, status: 'closed', pr: 'medium', worker: 'u-w1', appt: [-8, '10:00'], notes: ['Replaced the panel light and driver.'] },
  { by: 'u-stu4', cat: 'Water Supply/Plumbing', loc: 'MGH', room: '412', desc: 'No water in the washroom tap during the morning hours.', ago: 2, status: 'scheduled', pr: 'medium', worker: 'u-w4', appt: [1, '10:00'] },
  { by: 'u-stu4', cat: 'Electrical', loc: 'Mess / Dining Hall', room: 'Main hall', desc: 'Two ceiling fans in the mess hall are not working.', ago: 20, status: 'closed', pr: 'medium', worker: 'u-w1', appt: [-17, '15:00'], notes: ['Replaced capacitors in both fans.'] },
  { by: 'u-fac1', cat: 'Electrical', loc: 'Faculty Residence', room: 'A-12', desc: 'Power socket in the study room is burnt and the MCB trips repeatedly.', ago: 1, status: 'approved', pr: 'high', photos: 1 },
  { by: 'u-fac1', cat: 'Masonry', loc: 'Faculty Residence', room: 'A-12', desc: 'Seepage on the bathroom wall, paint is peeling off.', ago: 0.5, status: 'pending_review', pr: 'medium', photos: 2 },
  { by: 'u-fac1', cat: 'Internet', loc: 'Academic Block', room: 'CSE Dept, Room 305', desc: 'Wired network point in the faculty office is not working.', ago: 9, status: 'closed', pr: 'medium', worker: 'u-w5', appt: [-6, '11:00'], notes: ['Re-crimped the network cable and tested the port.'] },
];

export function buildMockDB(): DB {
  const users = USERS.map((u) => ({ ...u, leaveDates: u.leaveDates ? [...u.leaveDates] : undefined }));
  const nameOf = (id?: string) => users.find((u) => u.id === id)?.name ?? '';
  const appointments: Appointment[] = [];
  const notifications: Notification[] = [];
  let seq = 0;
  const nid = () => `n-${++seq}`;
  const notify = (userId: string, title: string, message: string, at: string, complaintId: string) =>
    notifications.push({ id: nid(), userId, title, message, createdAt: at, read: Date.now() - new Date(at).getTime() > 2 * 864e5, complaintId });

  const complaints: Complaint[] = SPECS.map((s, i) => {
    const id = `CMP-2026-${String(i + 1).padStart(4, '0')}`;
    const t0 = new Date(agoISO(s.ago)).getTime();
    const at = (h: number) => new Date(Math.min(Date.now() - 60000, t0 + h * 36e5)).toISOString();
    const requester = nameOf(s.by);
    const tl: TimelineEvent[] = [];
    const push = (e: Omit<TimelineEvent, 'id'>) => tl.push({ id: `${id}-e${tl.length}`, ...e });
    push({ at: at(0), actor: requester, kind: 'submitted', action: 'Complaint submitted' });
    notify(s.by, 'Complaint submitted', `${id} has been sent for admin review.`, at(0), id);
    if (s.status === 'pending_review') {
      notify('u-adm1', 'New complaint awaiting review', `${id} – ${s.cat} at ${s.loc}.`, at(0), id);
    } else if (s.status === 'rejected') {
      push({ at: at(3), actor: 'Rajesh Khanna', kind: 'rejected', action: 'Complaint rejected', detail: s.reason });
      notify(s.by, 'Complaint rejected', `${id} was rejected. Open the complaint to see the reason.`, at(3), id);
    } else {
      push({ at: at(3), actor: 'Rajesh Khanna', kind: 'approved', action: 'Complaint approved', detail: `Priority set to ${s.pr}.${s.remarks ? ' ' + s.remarks : ''}` });
      notify(s.by, 'Complaint approved', `${id} was approved. Book a technician slot.`, at(3), id);
      if (s.worker && !s.appt) push({ at: at(3.1), actor: 'Rajesh Khanna', kind: 'assigned', action: `Worker assigned: ${nameOf(s.worker)}` });
    }
    if (s.appt) {
      const [off, time] = s.appt;
      const d = new Date(); d.setDate(d.getDate() + off);
      const date = toDateStr(d);
      const booked = s.status === 'scheduled' || s.status === 'in_progress';
      appointments.push({ id: `a-${i + 1}`, complaintId: id, workerId: s.worker!, date, time, status: booked ? 'booked' : 'completed' });
      push({ at: at(8), actor: requester, kind: 'scheduled', action: 'Appointment booked', detail: `${fmtDate(date)} at ${fmtTime(time)} with ${nameOf(s.worker)}.` });
      notify(s.by, 'Appointment booked', `${id}: visit on ${fmtDate(date)} at ${fmtTime(time)}.`, at(8), id);
      notify(s.worker!, 'New appointment assigned', `${id} at ${s.loc} ${s.room} on ${fmtDate(date)}, ${fmtTime(time)}.`, at(8), id);
      const h = Number(time.slice(0, 2));
      const visitAt = new Date(isoAt(off, h)).toISOString();
      const vt = (m: number) => new Date(Math.min(Date.now() - 60000, new Date(visitAt).getTime() + m * 6e4)).toISOString();
      if (['in_progress', 'work_completed', 'closed'].includes(s.status)) {
        push({ at: vt(5), actor: nameOf(s.worker), kind: 'progress', action: 'Work started' });
        notify(s.by, 'Work in progress', `${nameOf(s.worker)} has started work on ${id}.`, vt(5), id);
      }
      if (['work_completed', 'closed'].includes(s.status)) {
        push({ at: vt(50), actor: nameOf(s.worker), kind: 'completed', action: 'Work completed', detail: s.notes?.[0] });
        notify(s.by, 'Work completed', `${id}: please confirm if the issue is resolved.`, vt(50), id);
      }
      if (s.status === 'closed') {
        push({ at: vt(600), actor: requester, kind: 'closed', action: 'Resolution confirmed. Complaint closed.' });
        notify('u-adm1', 'Complaint resolved', `${id} was confirmed resolved by ${requester}.`, vt(600), id);
      }
    } else if (s.worker && s.status === 'approved') {
      notify(s.worker, 'Complaint pre-assigned', `${id} was assigned to you. Awaiting the requester to book a slot.`, at(3.1), id);
    }
    return {
      id, category: s.cat, location: s.loc, room: s.room, description: s.desc,
      photos: Array.from({ length: s.photos ?? 0 }, (_, k) => placeholderPhoto(`${s.cat} photo ${k + 1}`)),
      requesterId: s.by, submittedAt: at(0), status: s.status, priority: s.pr, assignedWorkerId: s.worker,
      rejectionReason: s.reason, adminRemarks: s.remarks, timeline: tl,
      workNotes: (s.notes ?? []).map((text, k) => ({ id: `${id}-n${k}`, at: at(40), authorId: s.worker!, text })),
    };
  }).reverse();

  notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { users, complaints, appointments, notifications, currentUserId: null };
}
