import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#ef4444','#22c55e','#3b82f6'];

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, fetchProjects } = useOutletContext();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = (proj) => {
    fetchProjects();
    setShowCreate(false);
    navigate(`/projects/${proj._id}`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400">Here are all your projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Projects', value: projects.length, color: 'from-brand-500/20 to-brand-600/5' },
          { label: 'As Admin', value: projects.filter(p => p.admin._id === user?._id).length, color: 'from-purple-500/20 to-purple-600/5' },
          { label: 'As Member', value: projects.filter(p => p.admin._id !== user?._id).length, color: 'from-teal-500/20 to-teal-600/5' }
        ].map(stat => (
          <div key={stat.label} className={`card p-6 bg-gradient-to-br ${stat.color}`}>
            <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
            <p className="font-display text-4xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 9a2 2 0 012-2h8l3 3h9a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" stroke="#6366f1" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(proj => (
            <button
              key={proj._id}
              onClick={() => navigate(`/projects/${proj._id}`)}
              className="card p-6 text-left hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: proj.color || '#6366f1' }}
                >
                  {proj.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {proj.admin._id === user?._id ? 'Admin' : 'Member'}
                  </p>
                </div>
              </div>

              {proj.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{proj.description}</p>
              )}

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {proj.members.slice(0, 4).map(m => (
                    <img
                      key={m.user._id}
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=6366f1`}
                      alt={m.user.name}
                      className="w-7 h-7 rounded-full border-2 border-slate-900"
                      title={m.user.name}
                    />
                  ))}
                </div>
                <span className="text-slate-500 text-xs ml-1">
                  {proj.members.length} member{proj.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
