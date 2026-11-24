export type Role = 'student' | 'faculty' | 'admin' | 'worker';

export const CATEGORIES = ['Carpentry', 'Electrical', 'Internet', 'Masonry', 'Water Supply/Plumbing', 'Welding', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];

export type Status = 'pending_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'work_completed' | 'closed';
export const STATUS_LABEL: Record<Status, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved – Book Slot',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  work_completed: 'Awaiting Confirmation',
  closed: 'Closed',
};

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
/** Target resolution time (days from submission) used to flag overdue complaints. */
export const SLA_DAYS: Record<Priority, number> = { urgent: 1, high: 3, medium: 5, low: 7 };

export const LOCATIONS = [
  'BH-1', 'BH-2', 'BH-3', 'BH-4', 'BH-5', 'BH-6', 'BH-7', 'MBH-A', 'MBH-B', 'GH-1', 'GH-2', 'MGH',
  'Faculty Residence', 'Academic Block', 'Library', 'Administrative Block', 'Mess / Dining Hall', 'Sports Complex', 'Other',
];
export const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface User {
  id: string;
  name: string;
  role: Role;
  identifier: string; // roll no / employee id
  email: string;
  phone: string;
  department?: string;
  hostel?: string;
  room?: string;
  // worker-only
  skills?: Category[];
  availableDays?: number[]; // 0 = Sunday
  leaveDates?: string[]; // YYYY-MM-DD
}

export type EventKind =
  | 'submitted' | 'approved' | 'rejected' | 'assigned' | 'priority' | 'scheduled'
  | 'rescheduled' | 'cancelled' | 'progress' | 'note' | 'completed' | 'closed' | 'reopened';

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  actor: string;
  kind: EventKind;
  action: string;
  detail?: string;
}

export interface WorkNote { id: string; at: string; authorId: string; text: string }

export interface Complaint {
  id: string;
  category: Category;
  location: string;
  room: string;
  description: string;
  photos: string[];
  requesterId: string;
  submittedAt: string;
  status: Status;
  priority: Priority;
  assignedWorkerId?: string;
  rejectionReason?: string;
  adminRemarks?: string;
  feedback?: string;
  timeline: TimelineEvent[];
  workNotes: WorkNote[];
}

export interface Appointment {
  id: string;
  complaintId: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'booked' | 'completed' | 'cancelled';
}

export interface Slot { date: string; time: string; workerId: string }

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  complaintId?: string;
  createdAt: string;
  read: boolean;
}

export interface DB {
  users: User[];
  complaints: Complaint[];
  appointments: Appointment[];
  notifications: Notification[];
  currentUserId: string | null;
}
