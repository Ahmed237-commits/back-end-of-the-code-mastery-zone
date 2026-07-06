// controllers/enrollController.js
const asyncHandler = require('express-async-handler');
const { User, Course } = require('../models');

// ===============================
// تسجيل مستخدم في كورس (انضمام)
// ===============================
const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // جلب المستخدم
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // التحقق مما إذا كان المستخدم مسجلاً بالفعل في الكورس
  const alreadyEnrolled = user.enrolledCourses?.some(
    e => e.courseId.toString() === courseId
  );

  if (!alreadyEnrolled) {
    // إضافة الكورس إلى قائمة الكورسات المسجل فيها
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        enrolledCourses: {
          courseId,
          enrolledAt: new Date(),
          completed: false
        }
      }
    });
  }

  // زيادة عدد الطلاب في الكورس
  await Course.findByIdAndUpdate(courseId, { 
    $inc: { studentsCount: 1 } 
  });

  res.status(200).json({
    message: 'Successfully enrolled in course',
    courseId,
    courseTitle: course.title,
    enrolledAt: new Date()
  });
});

// ===============================
// جلب إحصائيات المستخدم في الكورس
// ===============================
const getUserCourseStats = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId).select('watchedVideos enrolledCourses');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // جلب جميع الفيديوهات التي شاهدها المستخدم في هذا الكورس
  const courseVideos = user.watchedVideos.filter(
    v => v.courseId.toString() === courseId
  );

  // عدد الدروس المكتملة
  const completedLessons = courseVideos.filter(v => v.completed).length;
  
  // إجمالي الدروس في الكورس
  const course = await Course.findById(courseId).select('lessons');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  const totalLessons = course.lessons?.length || 0;

  // التحقق مما إذا كان المستخدم مسجلاً في الكورس
  const isEnrolled = user.enrolledCourses?.some(
    e => e.courseId.toString() === courseId
  );

  res.status(200).json({
    courseId,
    isEnrolled,
    totalLessons,
    watchedLessons: courseVideos.length,
    completedLessons,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    lastWatched: courseVideos.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))[0] || null
  });
});
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Check for Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  enrollInCourse,
  getUserCourseStats,
  notFound,
  errorHandler
};