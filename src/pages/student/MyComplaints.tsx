import { Link } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ComplaintTable } from '../../components/complaint/ComplaintTable';
import { PageHeader } from '../../components/ui/Common';

export default function MyComplaints() {
  const { db, me } = useApp();
  const mine = db.complaints.filter((c) => c.requesterId === me!.id);
  return (
    <div>
      <PageHeader title="My Complaints" subtitle="Select a complaint to see its timeline and next steps."
        actions={<Link to="/complaints/new" className="btn-primary"><FilePlus2 size={16} /> Submit complaint</Link>} />
      <ComplaintTable complaints={mine} emptyTitle="You have not submitted any complaints" emptyText="Use Submit complaint to report a maintenance issue." />
    </div>
  );
}
