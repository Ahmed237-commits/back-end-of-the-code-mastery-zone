const asyncHandler = require('express-async-handler');
const { Course } = require('../models');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (course) {
        res.json(course);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Public (for now)
const createCourse = asyncHandler(async (req, res) => {
    const course = await Course.create(req.body);
    res.status(201).json(course);
});
const increaseStudentsCount = asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
            $inc: {
                studentsCount: 1
            }
        },
        {
            new: true
        }
    );

    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    res.status(200).json({
        success: true,
        studentsCount: course.studentsCount,
    });
});
module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    increaseStudentsCount
};
