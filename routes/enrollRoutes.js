// routes/enrollRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const {
  enrollInCourse,
  getUserCourseStats
} = require('../controllers/enrollController');

// جميع المسارات محمية (تحتاج تسجيل دخول)
router.use(protect);

// تسجيل مستخدم في كورس
router.post('/course', enrollInCourse);

// جلب إحصائيات المستخدم في كورس معين
router.get('/course/:courseId/stats', getUserCourseStats);

module.exports = router;