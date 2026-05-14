import { format, isPast, parseISO } from 'date-fns';

const PRIORITY_BADGE = {
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low'
};

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];

export default function TaskCard({ task, isAdmin, currentUser, onEdit, onDelete, onStatusChange }) {
  const isAssignee = task.assignedTo?._id === currentUser?._id;
  const canEdit = isAdmin || isAssignee;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done';

  return (
    <div className="card p-4 hover:border-slate-700 transition-all duration-200 group animate-fade-in">
      {/* Priority & Actions */}
      <div className="flex items-start justify-between mb-3">
        <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
        {canEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Edit"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isAdmin && (
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-medium mb-1 text-sm leading-snug ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
        {task.title}
      </h3>

      {task.description && (
        <p className="text-slate-500 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div className={`flex items-center gap-1.5 text-xs mb-3 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {isOverdue ? 'Overdue · ' : ''}{format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
        {/* Assignee */}
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedTo.name}&backgroundColor=6366f1`}
              alt={task.assignedTo.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-slate-400">{task.assignedTo.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-600">Unassigned</span>
        )}

        {/* Status change */}
        {canEdit && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 cursor-pointer focus:border-brand-500"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
