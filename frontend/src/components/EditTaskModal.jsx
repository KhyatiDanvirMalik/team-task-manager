import { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { format } from 'date-fns';

export default function EditTaskModal({ task, project, isAdmin, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    assignedTo: task.assignedTo?._id || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = isAdmin
        ? { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null }
        : { status: form.status };
      const { data } = await API.put(`/tasks/${task._id}`, payload);
      toast.success('Task updated!');
      onUpdated(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="input-field">
                  <option>To Do</option><option>In Progress</option><option>Done</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign To</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input-field">
                <option value="">Unassigned</option>
                {project.members.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input-field" />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option>To Do</option><option>In Progress</option><option>Done</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">As a member, you can only update the status of your assigned tasks.</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
