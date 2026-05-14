const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @GET /api/dashboard - Get dashboard stats for a project
router.get('/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar');

    const now = new Date();

    // Stats by status
    const totalTasks = tasks.length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    ).length;

    // Tasks per user
    const userTaskMap = {};
    tasks.forEach(task => {
      if (task.assignedTo) {
        const uid = task.assignedTo._id.toString();
        if (!userTaskMap[uid]) {
          userTaskMap[uid] = {
            user: task.assignedTo,
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0
          };
        }
        userTaskMap[uid].total++;
        if (task.status === 'To Do') userTaskMap[uid].todo++;
        else if (task.status === 'In Progress') userTaskMap[uid].inProgress++;
        else if (task.status === 'Done') userTaskMap[uid].done++;
      }
    });

    // Priority breakdown
    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const mediumPriority = tasks.filter(t => t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low').length;

    res.json({
      totalTasks,
      byStatus: { todo, inProgress, done },
      overdue,
      byPriority: { high: highPriority, medium: mediumPriority, low: lowPriority },
      byUser: Object.values(userTaskMap),
      recentTasks: tasks.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
