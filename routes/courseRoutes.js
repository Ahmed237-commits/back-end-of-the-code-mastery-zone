const express = require('express');
const router = express.Router();

const {
    getCourses,
    getCourseById,
    createCourse,
    increaseStudentsCount
} = require('../controllers/courseController');

const { protect } = require('../middleware/authmiddleware');

router.route('/')
    .get(getCourses)
    .post(createCourse);

router.route('/:id')
    .get(getCourseById);

// زيادة عدد الطلاب
router.put('/:id/students', protect, increaseStudentsCount);

module.exports = router;