import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Wrench, GraduationCap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Role } from '../types';

const QUICK: { id: string; role: Role; label: string; icon: typeof UserIcon; desc: string }[] = [
  { id: 'u-stu1', role: 'student', label: 'Student', icon: UserIcon, desc: 'Aarav Sharma · BH-3' },
  { id: 'u-fac1', role: 'faculty', label: 'Faculty', icon: GraduationCap, desc: 'Dr. Neha Malhotra' },
  { id: 'u-adm1', role: 'admin', label: 'Admin', icon: Shield, desc: 'Rajesh Khanna · Estate' },
  { id: 'u-w1', role: 'worker', label: 'Worker', icon: Wrench, desc: 'Ramesh Kumar · Electrical' },
];

export default function Login() {
  const { db, me, login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  if (me) return <Navigate to="/" replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() || x.identifier.toLowerCase() === email.trim().toLowerCase());
    if (!u || pw !== 'demo123') return setErr('Invalid user ID or password. Demo password is demo123.');
    login(u.id); nav('/');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-900 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-lg font-bold text-blue-900">N</div>
          <div>
            <p className="font-semibold">Dr. B. R. Ambedkar National Institute of Technology, Jalandhar</p>
            <p className="text-sm text-blue-200">Campus Maintenance &amp; Complaint Management</p>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-5 p-4 md:grid-cols-2 md:py-10">
        <form onSubmit={submit} className="card self-start">
          <div className="card-title">Sign in</div>
          <div className="space-y-3 p-4">
            <label className="block"><span className="mb-1 block text-sm font-medium">Email or User ID</span>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. aarav.sharma@nitj.ac.in" autoComplete="username" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">Password</span>
              <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></label>
            {err && <p className="text-sm text-red-700" role="alert">{err}</p>}
            <button className="btn-primary w-full" type="submit">Sign in</button>
            <p className="text-xs text-slate-500">Phase 1 uses mock authentication. Use any demo email with password <b>demo123</b>, or pick a demo account.</p>
          </div>
        </form>
        <div className="card self-start">
          <div className="card-title">Demo accounts</div>
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {QUICK.map((q) => (
              <button key={q.id} onClick={() => { login(q.id); nav('/'); }} className="flex items-center gap-3 rounded border border-slate-200 p-3 text-left hover:border-blue-500 hover:bg-blue-50">
                <q.icon className="text-blue-700" size={22} />
                <span><span className="block text-sm font-medium">{q.label}</span><span className="block text-xs text-slate-500">{q.desc}</span></span>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-200 p-4">
            <label className="block text-sm font-medium">More demo users
              <select className="input mt-1" defaultValue="" onChange={(e) => { if (e.target.value) { login(e.target.value); nav('/'); } }}>
                <option value="">Select a user…</option>
                {db.users.map((u) => <option key={u.id} value={u.id}>{u.role[0].toUpperCase() + u.role.slice(1)} – {u.name} ({u.email})</option>)}
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-500">You can switch users anytime from the header while logged in.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
