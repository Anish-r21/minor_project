import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useApp } from './store/AppContext';
import { Role } from './types';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ComplaintDetail from './pages/ComplaintDetail';
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaint from './pages/student/SubmitComplaint';
import MyComplaints from './pages/student/MyComplaints';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminList from './pages/admin/AdminList';
import ScheduledJobs from './pages/admin/ScheduledJobs';
import Workers from './pages/admin/Workers';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import Jobs from './pages/worker/Jobs';

function Protected() {
  const { me } = useApp();
  return me ? <AppLayout /> : <Navigate to="/login" replace />;
}
function Gate({ roles }: { roles: Role[] }) {
  const { me } = useApp();
  return me && roles.includes(me.role) ? <Outlet /> : <Navigate to="/" replace />;
}
function Home() {
  const { me } = useApp();
  return me?.role === 'admin' ? <AdminDashboard /> : me?.role === 'worker' ? <WorkerDashboard /> : <StudentDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route index element={<Home />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route element={<Gate roles={['student', 'faculty']} />}>
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="complaints/new" element={<SubmitComplaint />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
        </Route>
        <Route element={<Gate roles={['admin']} />}>
          <Route path="admin/scheduled" element={<ScheduledJobs />} />
          <Route path="admin/workers" element={<Workers />} />
          <Route path="admin/complaints/:id" element={<ComplaintDetail />} />
          <Route path="admin/:list" element={<AdminList />} />
        </Route>
        <Route element={<Gate roles={['worker']} />}>
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<ComplaintDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
