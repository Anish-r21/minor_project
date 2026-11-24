import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { WEEKDAYS } from '../types';
import { fmtDate } from '../utils/format';
import { Field, InfoRow, PageHeader } from '../components/ui/Common';

export default function Profile() {
  const { me, updatePhone, toast } = useApp();
  const u = me!;
  const [phone, setPhone] = useState(u.phone);
  const valid = /^\d{10}$/.test(phone);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="card-title">Details</div>
          <dl className="px-4 py-2">
            <InfoRow label="Name">{u.name}</InfoRow>
            <InfoRow label="Role"><span className="capitalize">{u.role}</span></InfoRow>
            <InfoRow label={u.role === 'student' ? 'Roll number' : 'Employee ID'}>{u.identifier}</InfoRow>
            <InfoRow label="Email">{u.email}</InfoRow>
            {u.department && <InfoRow label="Department">{u.department}</InfoRow>}
            {u.hostel && <InfoRow label="Hostel / Residence">{u.hostel}, Room {u.room}</InfoRow>}
            {u.skills && <InfoRow label="Skills">{u.skills.join(', ')}</InfoRow>}
            {u.availableDays && <InfoRow label="Working days">{u.availableDays.map((d) => WEEKDAYS[d]).join(', ')}</InfoRow>}
            {u.role === 'worker' && <InfoRow label="Upcoming leave">{u.leaveDates?.length ? u.leaveDates.map(fmtDate).join(', ') : 'None'}</InfoRow>}
          </dl>
        </div>
        <div className="card self-start">
          <div className="card-title">Contact number</div>
          <div className="space-y-3 p-4">
            <Field label="Mobile number" hint="Shared with the assigned technician for visits.">
              <input className="input" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
            </Field>
            <button className="btn-primary" disabled={!valid || phone === u.phone} onClick={() => { updatePhone(phone); toast('Contact number updated.'); }}>Save changes</button>
            {!valid && <p className="text-xs text-red-700">Enter a 10-digit mobile number.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
