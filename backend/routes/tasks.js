const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Task = require('../models/Task');
const Project = require('../models/Project');

const { protect } = require('../middleware/auth');


// ================= HELPERS =================

const getId = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};


const isMember = (project, userId) => {
  return project.members.some(member => {
    return getId(member.user) === getId(userId);
  });
};


const isAdmin = (project, userId) => {
  return getId(project.admin) === getId(userId);
};


// ================= GET PROJECT TASKS =================

router.get('/project/:projectId', protect, async (req, res) => {

  try {

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (!isMember(project, req.user._id)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const tasks = await Task.find({
      project: req.params.projectId
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(tasks);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= CREATE TASK =================

router.post(
  '/',
  protect,
  [
    body('title')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Task title must be at least 2 characters')
  ],
  async (req, res) => {

    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg
        });
      }

      const {
        title,
        description,
        projectId,
        assignedTo,
        priority,
        dueDate
      } = req.body;

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      if (!isMember(project, req.user._id)) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo: assignedTo || null,
        createdBy: req.user._id,
        priority: priority || 'Medium',
        dueDate: dueDate || null
      });

      const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar');

      res.status(201).json(populatedTask);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ================= UPDATE TASK =================

router.put('/:id', protect, async (req, res) => {

  try {

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (!isMember(project, req.user._id)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate
    } = req.body;

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json(updatedTask);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= DELETE TASK =================

router.delete('/:id', protect, async (req, res) => {

  try {

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (!isAdmin(project, req.user._id)) {
      return res.status(403).json({
        message: 'Only admin can delete tasks'
      });
    }

    await task.deleteOne();

    res.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= GET SINGLE TASK =================

router.get('/:id', protect, async (req, res) => {

  try {

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (!isMember(project, req.user._id)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json(task);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


module.exports = router;