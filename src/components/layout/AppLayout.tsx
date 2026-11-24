import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CalendarDays, CheckCircle2, ClipboardList, FilePlus2, Inbox, LayoutDashboard, ListChecks, LogOut, Menu, RotateCcw, ThumbsDown, User as UserIcon, Users, X, Wrench, CalendarCheck } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Role } from '../../types';
import { fmtDateTime } from '../../utils/format';
import { Toasts } from '../ui/Common';

const NAV: Record<Role, { to: string; label: string; icon: typeof Menu; end?: boolean }[]> = {
  student: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/complaints/new', label: 'Submit Complaint', icon: FilePlus2 },
    { to: '/complaints', label: 'My Complaints', icon: ClipboardList, end: true },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ],
  faculty: [],
  admin: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/pending', label: 'Pending Review', icon: Inbox },
    { to: '/admin/approved', label: 'Approved', icon: CheckCircle2 },
    { to: '/admin/rejected', label: 'Rejected', icon: ThumbsDown },
    { to: '/admin/scheduled', label: 'Scheduled Jobs', icon: CalendarDays },
    { to: '/admin/overdue', label: 'Overdue', icon: AlertTriangle },
    { to: '/admin/all', label: 'All Complaints', icon: ClipboardList },
    { to: '/admin/workers', label: 'Workers', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ],
  worker: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/jobs', label: 'My Jobs', icon: Wrench, end: true },
    { to: '/jobs?tab=today', label: "Today's Appointments", icon: CalendarCheck },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ],
};
NAV.faculty = NAV.student;
const ROLE_LABEL: Record<Role, string> = { student: 'Student', faculty: 'Faculty', admin: 'Admin', worker: 'Worker' };

export default function AppLayout() {
  const { me, db, login, logout, toasts, markRead, markAllRead, resetDemo } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); setBell(false); }, [loc.pathname, loc.search]);
  useEffect(() => {
    const h = (e: MouseEvent) => bellRef.current && !bellRef.current.contains(e.target as Node) && setBell(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  if (!me) return null;
  const mine = db.notifications.filter((n) => n.userId === me.id);
  const unread = mine.filter((n) => !n.read).length;

  const sidebar = (
    <nav className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{me.name}</p>
        <p className="text-xs text-slate-500">{ROLE_LABEL[me.role]} · {me.identifier}</p>
      </div>
      <ul className="flex-1 space-y-0.5 p-2">
        {NAV[me.role].map((n) => (
          <li key={n.to}>
            <NavLink to={n.to} end={n.end}
              className={({ isActive }) => {
                const active = n.to.includes('?') ? loc.pathname + loc.search === n.to : isActive && !(n.to === '/jobs' && loc.search.includes('today'));
                return `flex items-center gap-2.5 rounded px-3 py-2 text-sm ${active ? 'bg-blue-50 font-medium text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`;
              }}>
              <n.icon size={17} /> {n.label}
              {n.label === 'Notifications' && unread > 0 && <span className="ml-auto rounded-full bg-red-600 px-1.5 text-xs text-white">{unread}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-slate-200 p-2">
        <button className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" onClick={resetDemo}><RotateCcw size={16} /> Reset demo data</button>
        <button className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" onClick={() => { logout(); nav('/login'); }}><LogOut size={16} /> Log out</button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-blue-900 px-3 text-white shadow">
        <button className="rounded p-1.5 hover:bg-blue-800 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
        <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-sm font-bold text-blue-900">N</div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">NIT Jalandhar · Campus Maintenance</p>
          <p className="hidden text-xs text-blue-200 sm:block">Complaint &amp; Service Management</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="hidden items-center gap-1.5 text-xs text-blue-100 md:flex">
            Demo user
            <select className="max-w-[190px] rounded border border-blue-700 bg-blue-800 px-2 py-1 text-xs text-white" value={me.id}
              onChange={(e) => { login(e.target.value); nav('/'); }} aria-label="Switch demo user">
              {(['student', 'faculty', 'admin', 'worker'] as Role[]).map((r) => (
                <optgroup key={r} label={ROLE_LABEL[r]}>{db.users.filter((u) => u.role === r).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</optgroup>
              ))}
            </select>
          </label>
          <div className="relative" ref={bellRef}>
            <button className="relative rounded p-2 hover:bg-blue-800" onClick={() => setBell(!bell)} aria-label="Notifications">
              <Bell size={19} />
              {unread > 0 && <span className="absolute right-0.5 top-0.5 min-w-[16px] rounded-full bg-red-500 px-1 text-center text-[10px] leading-4">{unread}</span>}
            </button>
            {bell && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded border border-slate-200 bg-white text-slate-800 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                  <span className="text-sm font-semibold">Notifications</span>
                  <button className="text-xs text-blue-700 hover:underline" onClick={markAllRead}>Mark all read</button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {mine.slice(0, 6).map((n) => (
                    <li key={n.id}>
                      <button className={`block w-full border-b border-slate-100 px-3 py-2 text-left hover:bg-slate-50 ${n.read ? '' : 'bg-blue-50/60'}`}
                        onClick={() => { markRead(n.id); if (n.complaintId) nav(`${me.role === 'admin' ? '/admin/complaints' : me.role === 'worker' ? '/jobs' : '/complaints'}/${n.complaintId}`); }}>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-slate-600">{n.message}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{fmtDateTime(n.createdAt)}</p>
                      </button>
                    </li>
                  ))}
                  {mine.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">No notifications yet.</li>}
                </ul>
                <button className="block w-full px-3 py-2 text-center text-sm text-blue-700 hover:bg-slate-50" onClick={() => nav('/notifications')}>View all</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-slate-200 lg:block">{sidebar}</aside>
        {open && (
          <div className="fixed inset-0 top-14 z-20 lg:hidden" onClick={() => setOpen(false)}>
            <div className="h-full w-64 border-r border-slate-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-slate-200 bg-white p-2 md:hidden">
                <select className="input" value={me.id} onChange={(e) => { login(e.target.value); nav('/'); }} aria-label="Switch demo user">
                  {db.users.map((u) => <option key={u.id} value={u.id}>{ROLE_LABEL[u.role]}: {u.name}</option>)}
                </select>
              </div>
              {sidebar}
            </div>
            <div className="absolute inset-0 -z-10 bg-slate-900/40" />
          </div>
        )}
        <main className="min-w-0 flex-1 p-3 sm:p-5"><Outlet /></main>
      </div>
      <Toasts items={toasts} />
    </div>
  );
}
