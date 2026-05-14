import { useMemo } from 'react';
import { isPast } from 'date-fns';

export default function DashboardPanel({ tasks, members }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const overdue = tasks.filter(t =>
      t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'Done'
    ).length;

    const byPriority = {
      High: tasks.filter(t => t.priority === 'High').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      Low: tasks.filter(t => t.priority === 'Low').length,
    };

    const userMap = {};
    tasks.forEach(task => {
      if (task.assignedTo) {
        const uid = task.assignedTo._id;
        if (!userMap[uid]) {
          userMap[uid] = { user: task.assignedTo, todo: 0, inProgress: 0, done: 0 };
        }
        if (task.status === 'To Do') userMap[uid].todo++;
        else if (task.status === 'In Progress') userMap[uid].inProgress++;
        else userMap[uid].done++;
      }
    });

    return { total, todo, inProgress, done, overdue, byPriority, byUser: Object.values(userMap) };
  }, [tasks]);

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl animate-fade-in">
      <h2 className="font-display text-xl font-bold text-white mb-6">Project Dashboard</h2>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-white' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-amber-400' },
          { label: 'Completed', value: stats.done, color: 'text-emerald-400' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion progress */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Overall Completion</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3"/>
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${completionPct} ${100 - completionPct}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-white text-lg">
                {completionPct}%
              </span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'To Do', count: stats.todo, color: 'bg-slate-500' },
                { label: 'In Progress', count: stats.inProgress, color: 'bg-amber-400' },
                { label: 'Done', count: stats.done, color: 'bg-emerald-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="text-xs text-slate-500 ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">By Priority</h3>
          <div className="space-y-3">
            {[
              { label: 'High', count: stats.byPriority.High, color: 'bg-red-400', textColor: 'text-red-400' },
              { label: 'Medium', count: stats.byPriority.Medium, color: 'bg-amber-400', textColor: 'text-amber-400' },
              { label: 'Low', count: stats.byPriority.Low, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
            ].map(p => (
              <div key={p.label}>
                <div className="flex justify-between mb-1">
                  <span className={`text-xs font-medium ${p.textColor}`}>{p.label}</span>
                  <span className="text-xs text-slate-500">{p.count} tasks</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all duration-700`}
                    style={{ width: stats.total ? `${(p.count / stats.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks per user */}
        <div className="card p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Tasks per Team Member</h3>
          {stats.byUser.length === 0 ? (
            <p className="text-slate-600 text-sm">No tasks assigned yet</p>
          ) : (
            <div className="space-y-4">
              {stats.byUser.map(u => {
                const total = u.todo + u.inProgress + u.done;
                return (
                  <div key={u.user._id} className="flex items-center gap-4">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.user.name}&backgroundColor=6366f1`}
                      alt={u.user.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-300 truncate">{u.user.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{total} tasks</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                        {u.done > 0 && (
                          <div
                            className="h-full bg-emerald-500 transition-all duration-700"
                            style={{ width: `${(u.done / total) * 100}%` }}
                          />
                        )}
                        {u.inProgress > 0 && (
                          <div
                            className="h-full bg-amber-400 transition-all duration-700"
                            style={{ width: `${(u.inProgress / total) * 100}%` }}
                          />
                        )}
                        {u.todo > 0 && (
                          <div
                            className="h-full bg-slate-600 transition-all duration-700"
                            style={{ width: `${(u.todo / total) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500 flex-shrink-0">
                      <span className="text-emerald-400">{u.done}✓</span>
                      <span className="text-amber-400">{u.inProgress}▶</span>
                      <span>{u.todo}○</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
