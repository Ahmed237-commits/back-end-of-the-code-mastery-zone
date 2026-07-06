// controllers/enrollController.js
const asyncHandler = require('express-async-handler');
const { User, Course } = require('../models');

// ===============================
// تسجيل مستخدم في كورس (انضمام)
// ===============================
const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  console.log('📝 Enrolling user in course:', { userId, courseId });

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

  // التأكد من وجود حقل enrolledCourses
  if (!user.enrolledCourses) {
    user.enrolledCourses = [];
  }

  // التحقق مما إذا كان المستخدم مسجلاً بالفعل
  const alreadyEnrolled = user.enrolledCourses.some(
    e => e.courseId && e.courseId.toString() === courseId
  );

  if (!alreadyEnrolled) {
    // إضافة الكورس إلى قائمة الكورسات المسجل فيها
    user.enrolledCourses.push({
      courseId,
      enrolledAt: new Date(),
      completed: false
    });
    await user.save();

    // زيادة عدد الطلاب في الكورس
    const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
        $inc: {
            studentsCount: 1,
        },
    },
    {
        new: true,
    }
);

    console.log('✅ User enrolled successfully');
  } else {
    console.log('ℹ️ User already enrolled');
  }

  res.status(200).json({
    success: true,
    message: "Successfully enrolled in course",
    courseId,
    courseTitle: updatedCourse.title,
    studentsCount: updatedCourse.studentsCount,
    enrolledAt: new Date(),
});
});
// ===============================
// جلب إحصائيات المستخدم في الكورس
// ===============================
const getUserCourseStats = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  console.log('📊 Getting course stats for:', { userId, courseId });

  const user = await User.findById(userId).select('watchedVideos enrolledCourses');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const course = await Course.findById(courseId).select('lessons');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const courseVideos = user.watchedVideos ? user.watchedVideos.filter(
    v => v.courseId && v.courseId.toString() === courseId
  ) : [];

  const completedLessons = courseVideos.filter(v => v.completed).length;
  const totalLessons = course.lessons?.length || 10;

  const isEnrolled = user.enrolledCourses ? user.enrolledCourses.some(
    e => e.courseId && e.courseId.toString() === courseId
  ) : false;

  console.log('✅ Course stats:', {
    completedLessons,
    totalLessons,
    percentage: Math.round((completedLessons / totalLessons) * 100)
  });

  res.status(200).json({
    courseId,
    isEnrolled,
    totalLessons,
    watchedLessons: courseVideos.length,
    completedLessons,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    lastWatched: courseVideos.length > 0 ? 
      courseVideos.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))[0] : null
  });
});

module.exports = {
  enrollInCourse,
  getUserCourseStats
};