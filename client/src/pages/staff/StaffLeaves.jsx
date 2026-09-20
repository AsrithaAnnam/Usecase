import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function StaffLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchLeaves = () => {
    api.get('/leaves/my').then(({ data }) => setLeaves(data.data.leaves)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/leaves', data);
      toast.success('Leave request submitted');
      setModalOpen(false);
      reset();
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const cancelLeave = async (id) => {
    try {
      await api.patch(`/leaves/${id}/cancel`);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <DashboardLayout title="Leave Management" role="staff">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Request Leave</button>
      </div>

      {loading ? <LoadingSpinner /> : leaves.length === 0 ? (
        <EmptyState title="No leave requests" description="Create your first leave request" />
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Dates</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} className="border-b border-white/5">
                  <td className="py-3 pr-4 capitalize">{l.leaveType}</td>
                  <td className="py-3 pr-4">{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                  <td className="py-3 pr-4">{l.totalDays}</td>
                  <td className="py-3 pr-4"><span className={statusBadge(l.status)}>{l.status}</span></td>
                  <td className="py-3">
                    {l.status === 'pending' && (
                      <button onClick={() => cancelLeave(l._id)} className="text-sm text-red-400 hover:underline">Cancel</button>
                    )}
                    {l.approvalComment && <p className="text-xs text-white/50 mt-1">{l.approvalComment}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Request Leave">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Leave Type</label>
            <select {...register('leaveType')} className="glass-input">
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/70">Start Date</label>
              <input {...register('startDate')} type="date" className="glass-input" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">End Date</label>
              <input {...register('endDate')} type="date" className="glass-input" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Day Type</label>
            <select {...register('dayType')} className="glass-input">
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Reason</label>
            <textarea {...register('reason')} className="glass-input min-h-[80px]" required />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Submit Request</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
