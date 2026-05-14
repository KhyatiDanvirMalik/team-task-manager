import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import CreateProjectModal from './CreateProjectModal';

const Icons = {
  logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill="#6366f1"/>
      <path d="M7 14l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  logout: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  folder: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1 4a1 1 0 011-1h4l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  grid: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch {}
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleProjectCreated = (proj) => {
    setProjects(prev => [proj, ...prev]);
    setShowCreate(false);
    navigate(`/projects/${proj._id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Icons.logo />
            <span className="font-display text-xl font-700 text-white tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 flex-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all text-sm font-medium
              ${isActive ? 'bg-brand-500/15 text-brand-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`
            }
          >
            <Icons.grid />
            All Projects
          </NavLink>

          {/* Projects */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</span>
              <button
                onClick={() => setShowCreate(true)}
                className="text-slate-500 hover:text-brand-400 transition-colors"
                title="New Project"
              >
                <Icons.plus />
              </button>
            </div>

            <div className="space-y-0.5">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-600 px-3 py-2">No projects yet</p>
              ) : (
                projects.map(proj => (
                  <NavLink
                    key={proj._id}
                    to={`/projects/${proj._id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                      ${isActive ? 'bg-brand-500/15 text-brand-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj.color || '#6366f1' }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </NavLink>
                ))
              )}
            </div>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}&backgroundColor=6366f1`}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Logout"
            >
              <Icons.logout />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ projects, fetchProjects }} />
      </main>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
