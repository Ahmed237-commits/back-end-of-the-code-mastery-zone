// routes/userProgressRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');

// استيراد الدوال من الكونترولر
const {
  trackWatchedVideo,
  getUserProgress,
  getLastWatched,
  markLessonAsCompleted,
  getCourseProgress
} = require('../controllers/userProgressController');

// جميع المسارات محمية (تحتاج تسجيل دخول)
router.use(protect);

// تسجيل مشاهدة فيديو
router.post('/track', trackWatchedVideo);

// جلب كل تقدم المستخدم
router.get('/', getUserProgress);

// جلب آخر فيديو شاهده
router.get('/last', getLastWatched);

// تحديد درس كمكتمل
router.put('/complete', markLessonAsCompleted);

// جلب تقدم كورس معين
router.get('/course/:courseId', getCourseProgress);

module.exports = router;