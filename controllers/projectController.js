const asyncHandler = require('express-async-handler');
const { Project, User } = require('../models');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find().populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json(projects);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Public (for now)
const createProject = asyncHandler(async (req, res) => {
    // Mock user for now
    let user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
        user = await User.create({
            name: 'Demo User',
            email: 'demo@example.com',
            avatar: 'https://i.pravatar.cc/150?u=demo'
        });
    }

    const { title, description, tags, link } = req.body;

    const project = await Project.create({
        title,
        description,
        tags,
        link,
        user: user._id
    });

    if (project) {
        await project.populate('user', 'name avatar');
        res.status(201).json(project);
    } else {
        res.status(400);
        throw new Error('Invalid project data');
    }
});

module.exports = {
    getProjects,
    createProject
};
