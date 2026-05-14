import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import MembersPanel from '../components/MembersPanel';
import DashboardPanel from '../components/DashboardPanel';

const TABS = ['Tasks', 'Dashboard', 'Members'];

export default function ProjectDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('Tasks');

  const [showCreateTask, setShowCreateTask] = useState(false);

  const [editingTask, setEditingTask] = useState(null);

  const [filter, setFilter] = useState('All');


  // ✅ FIXED ADMIN CHECK
  const isAdmin =
    String(project?.admin?._id || '') ===
    String(user?._id || '');


  // ✅ FETCH PROJECT
  const fetchProject = useCallback(async () => {

    try {

      const { data } = await API.get(`/projects/${id}`);

      setProject(data);

    } catch (err) {

      const status = err?.response?.status;

      if (status === 404 || status === 403) {
        setProject(null);
      }

      console.error(err);
    }

  }, [id]);


  // ✅ FETCH TASKS
  const fetchTasks = useCallback(async () => {

    try {

      const { data } = await API.get(`/tasks/project/${id}`);

      setTasks(data);

    } catch (err) {

      console.error(err);
    }

  }, [id]);


  // ✅ FIXED LOADING
  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);

        await Promise.all([
          fetchProject(),
          fetchTasks()
        ]);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }

  }, [id, fetchProject, fetchTasks]);


  // ✅ TASK CREATED
  const handleTaskCreated = (task) => {

    setTasks(prev => [task, ...prev]);

    setShowCreateTask(false);
  };


  // ✅ TASK UPDATED
  const handleTaskUpdated = (updatedTask) => {

    setTasks(prev =>
      prev.map(task =>
        task._id === updatedTask._id
          ? updatedTask
          : task
      )
    );

    setEditingTask(null);
  };


  // ✅ DELETE TASK
  const handleTaskDeleted = async (taskId) => {

    const confirmDelete = confirm('Delete this task?');

    if (!confirmDelete) return;

    try {

      await API.delete(`/tasks/${taskId}`);

      setTasks(prev =>
        prev.filter(task => task._id !== taskId)
      );

      toast.success('Task deleted');

    } catch (err) {

      toast.error(
        err.response?.data?.message || 'Failed to delete task'
      );
    }
  };


  // ✅ UPDATE STATUS
  const handleStatusChange = async (taskId, status) => {

    try {

      const { data } = await API.put(`/tasks/${taskId}`, {
        status
      });

      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? data : task
        )
      );

    } catch (err) {

      toast.error(
        err.response?.data?.message || 'Failed to update task'
      );
    }
  };


  // ✅ FILTER TASKS
  const filteredTasks =
    filter === 'All'
      ? tasks
      : tasks.filter(task => task.status === filter);


  // ✅ LOADING UI
  if (loading) {

    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }


  // ✅ PROJECT NOT FOUND
  if (!project && !loading) {

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">

        <p className="text-slate-400 text-lg">
          Project not found or you don't have access.
        </p>

        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          ← Back to Projects
        </button>

      </div>
    );
  }


  return (

    <div className="flex flex-col h-full animate-fade-in">

      {/* HEADER */}
      <div className="border-b border-slate-800 p-6 flex-shrink-0">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-4">

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{
                backgroundColor: project.color || '#6366f1'
              }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>

            <div>

              <h1 className="font-display text-2xl font-bold text-white">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-slate-400 text-sm mt-0.5">
                  {project.description}
                </p>
              )}

            </div>
          </div>


          <div className="flex items-center gap-3">

            <div className="flex -space-x-2">

              {project.members.slice(0, 5).map(member => (

                <img
                  key={member.user._id}
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.user.name}&backgroundColor=6366f1`}
                  alt={member.user.name}
                  className="w-8 h-8 rounded-full border-2 border-slate-950"
                  title={`${member.user.name} (${member.role})`}
                />
              ))}

            </div>


            {isAdmin && (

              <button
                onClick={() => setShowCreateTask(true)}
                className="btn-primary"
              >
                Add Task
              </button>
            )}

          </div>
        </div>


        {/* TABS */}
        <div className="flex gap-1">

          {TABS.map((t) => (

            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                tab === t
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}

        </div>
      </div>


      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">

        {tab === 'Tasks' && (

          <>
            {/* FILTERS */}
            <div className="flex gap-2 mb-6">

              {['All', 'To Do', 'In Progress', 'Done'].map((f) => (

                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    filter === f
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}

            </div>


            {/* TASK COLUMNS */}
            <div className="grid grid-cols-3 gap-4">

              {['To Do', 'In Progress', 'Done'].map((status) => {

                const columnTasks = filteredTasks.filter(
                  task => task.status === status
                );

                return (

                  <div key={status}>

                    <div className="flex items-center gap-2 mb-3">

                      <span
                        className={`w-2 h-2 rounded-full
                        ${
                          status === 'To Do'
                            ? 'bg-slate-500'
                            : status === 'In Progress'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />

                      <span className="text-sm font-medium text-slate-300">
                        {status}
                      </span>

                    </div>


                    <div className="space-y-3">

                      {columnTasks.map(task => (

                        <TaskCard
                          key={task._id}
                          task={task}
                          isAdmin={isAdmin}
                          currentUser={user}
                          onEdit={() => setEditingTask(task)}
                          onDelete={() => handleTaskDeleted(task._id)}
                          onStatusChange={(newStatus) =>
                            handleStatusChange(task._id, newStatus)
                          }
                        />
                      ))}


                      {columnTasks.length === 0 && (

                        <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center">

                          <p className="text-slate-600 text-sm">
                            No tasks
                          </p>

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          </>
        )}


        {tab === 'Dashboard' && (

          <DashboardPanel
            projectId={id}
            tasks={tasks}
            members={project.members}
          />
        )}


        {tab === 'Members' && (

          <MembersPanel
            project={project}
            isAdmin={isAdmin}
            onUpdate={setProject}
          />
        )}

      </div>


      {/* CREATE TASK */}
      {showCreateTask && (

        <CreateTaskModal
          project={project}
          onClose={() => setShowCreateTask(false)}
          onCreated={handleTaskCreated}
        />
      )}


      {/* EDIT TASK */}
      {editingTask && (

        <EditTaskModal
          task={editingTask}
          project={project}
          isAdmin={isAdmin}
          onClose={() => setEditingTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}

    </div>
  );
}