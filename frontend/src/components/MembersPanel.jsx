import { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function MembersPanel({ project, isAdmin, onUpdate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.post(`/projects/${project._id}/members`, { email: email.trim() });
      onUpdate(data);
      setEmail('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const { data } = await API.delete(`/projects/${project._id}/members/${userId}`);
      onUpdate(data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="font-display text-xl font-bold text-white mb-6">Team Members</h2>

      {/* Add member form (admin only) */}
      {isAdmin && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Add Member by Email</h3>
          <form onSubmit={handleAddMember} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="input-field flex-1"
            />
            <button type="submit" disabled={loading} className="btn-primary px-5">
              {loading ? 'Adding...' : 'Add'}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-2">The user must already have a TaskFlow account.</p>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {project.members.map(m => (
          <div key={m.user._id} className="card px-4 py-3 flex items-center gap-4">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=6366f1`}
              alt={m.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200">{m.user.name}</p>
              <p className="text-sm text-slate-500">{m.user.email}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              m.role === 'Admin'
                ? 'bg-brand-500/20 text-brand-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {m.role}
            </span>
            {isAdmin && m.role !== 'Admin' && (
              <button
                onClick={() => handleRemove(m.user._id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                title="Remove member"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
