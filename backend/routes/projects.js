const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

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


const isAdmin = (project, userId) => {
  return getId(project.admin) === getId(userId);
};


const isMember = (project, userId) => {
  return project.members.some(member => {
    return getId(member.user) === getId(userId);
  });
};


// ================= GET ALL PROJECTS =================

router.get('/', protect, async (req, res) => {

  try {

    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });


    res.json(projects);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= CREATE PROJECT =================

router.post(
  '/',
  protect,
  [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Project name must be at least 2 characters')
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
        name,
        description,
        color
      } = req.body;


      const project = await Project.create({
        name,
        description,
        color: color || '#6366f1',
        admin: req.user._id,
        members: [
          {
            user: req.user._id,
            role: 'Admin'
          }
        ]
      });


      const populatedProject = await Project.findById(project._id)
        .populate('admin', 'name email avatar')
        .populate('members.user', 'name email avatar');


      res.status(201).json(populatedProject);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ================= GET SINGLE PROJECT =================

router.get('/:id', protect, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar');


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


    res.json(project);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= UPDATE PROJECT =================

router.put('/:id', protect, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id);


    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }


    if (!isAdmin(project, req.user._id)) {
      return res.status(403).json({
        message: 'Only admin can update project'
      });
    }


    const {
      name,
      description,
      color
    } = req.body;


    if (name) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (color) {
      project.color = color;
    }


    await project.save();


    const updatedProject = await Project.findById(project._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar');


    res.json(updatedProject);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= DELETE PROJECT =================

router.delete('/:id', protect, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id);


    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }


    if (!isAdmin(project, req.user._id)) {
      return res.status(403).json({
        message: 'Only admin can delete project'
      });
    }


    await Task.deleteMany({
      project: project._id
    });


    await project.deleteOne();


    res.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= ADD MEMBER =================

router.post('/:id/members', protect, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id);


    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }


    if (!isAdmin(project, req.user._id)) {
      return res.status(403).json({
        message: 'Only admin can add members'
      });
    }


    const { email } = req.body;


    const userToAdd = await User.findOne({
      email: email.toLowerCase()
    });


    if (!userToAdd) {
      return res.status(404).json({
        message: 'User not found'
      });
    }


    const alreadyExists = project.members.some(member => {
      return getId(member.user) === getId(userToAdd._id);
    });


    if (alreadyExists) {
      return res.status(400).json({
        message: 'User already added'
      });
    }


    project.members.push({
      user: userToAdd._id,
      role: 'Member'
    });


    await project.save();


    const updatedProject = await Project.findById(project._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar');


    res.json(updatedProject);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= REMOVE MEMBER =================

router.delete('/:id/members/:userId', protect, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id);


    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }


    if (!isAdmin(project, req.user._id)) {
      return res.status(403).json({
        message: 'Only admin can remove members'
      });
    }


    if (getId(project.admin) === req.params.userId) {
      return res.status(400).json({
        message: 'Cannot remove admin'
      });
    }


    project.members = project.members.filter(member => {
      return getId(member.user) !== req.params.userId;
    });


    await project.save();


    const updatedProject = await Project.findById(project._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar');


    res.json(updatedProject);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


module.exports = router;