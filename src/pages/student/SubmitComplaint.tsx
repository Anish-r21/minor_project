import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { CATEGORIES, Category, LOCATIONS } from '../../types';
import { Field, PageHeader } from '../../components/ui/Common';

export default function SubmitComplaint() {
  const { me, submitComplaint, toast } = useApp();
  const nav = useNavigate();
  const [category, setCategory] = useState<Category | ''>('');
  const [location, setLocation] = useState(me?.hostel && LOCATIONS.includes(me.hostel) ? me.hostel : '');
  const [room, setRoom] = useState(me?.room ?? '');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tried, setTried] = useState(false);

  const addPhotos = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    files.forEach((f) => {
      if (!f.type.startsWith('image/')) return toast('Only image files can be attached.', 'error');
      if (f.size > 2 * 1024 * 1024) return toast(`${f.name} is larger than 2 MB.`, 'error');
      const r = new FileReader();
      r.onload = () => setPhotos((p) => (p.length < 3 ? [...p, r.result as string] : p));
      r.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const err = { category: !category, location: !location, room: !room.trim(), description: description.trim().length < 10 };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(err).some(Boolean)) return;
    const id = submitComplaint({ category: category as Category, location, room: room.trim(), description: description.trim(), photos });
    toast(`Complaint ${id} submitted for review.`);
    nav(`/complaints/${id}`);
  };
  const bad = (k: keyof typeof err) => (tried && err[k] ? 'border-red-500' : '');
  const msg = (k: keyof typeof err, t: string) => tried && err[k] && <span className="mt-1 block text-xs text-red-700">{t}</span>;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Submit Complaint" subtitle="Your complaint will be reviewed by the admin before a technician visit can be booked." />
      <form onSubmit={submit} className="card" noValidate>
        <div className="space-y-4 p-4">
          <div>
            <Field label="Complaint category" required>
              <select className={`input ${bad('category')}`} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                <option value="">Select category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>{msg('category', 'Select a category.')}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field label="Hostel / location" required>
                <select className={`input ${bad('location')}`} value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select hostel or location</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>{msg('location', 'Select a location.')}
            </div>
            <div>
              <Field label="Room number / specific location" required>
                <input className={`input ${bad('room')}`} value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 214 or 2nd floor washroom" />
              </Field>{msg('room', 'Enter the room or exact spot.')}
            </div>
          </div>
          <div>
            <Field label="Description" required hint={`${description.length}/500 characters`}>
              <textarea className={`input ${bad('description')}`} rows={5} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the problem, when it started and anything the technician should know." />
            </Field>{msg('description', 'Enter at least 10 characters.')}
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Photo attachment (optional)</span>
            <div className="flex flex-wrap items-center gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt={`Attachment ${i + 1}`} className="h-20 w-28 rounded border border-slate-200 object-cover" />
                  <button type="button" aria-label="Remove photo" className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}><X size={14} /></button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50">
                  <ImagePlus size={20} /> Add photo
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={addPhotos} />
                </label>
              )}
            </div>
            <span className="mt-1 block text-xs text-slate-500">Up to 3 images, 2 MB each.</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button type="button" className="btn-secondary" onClick={() => nav('/complaints')}>Cancel</button>
          <button type="submit" className="btn-primary">Submit complaint</button>
        </div>
      </form>
    </div>
  );
}
