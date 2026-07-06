// controllers/userProgressController.js
const asyncHandler = require('express-async-handler');
const { User, Course } = require('../models');

// ===============================
// تسجيل مشاهدة فيديو
// ===============================
const trackWatchedVideo = asyncHandler(async (req, res) => {
  const { courseId, lessonId, videoUrl, completed } = req.body;
  const userId = req.user.id;

  console.log('📝 Tracking video:', { courseId, lessonId, completed });

  if (!courseId || !lessonId) {
    res.status(400);
    throw new Error('courseId and lessonId are required');
  }

  // التحقق من وجود المستخدم
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  console.log('👤 User before update:', {
    watchedVideosCount: user.watchedVideos.length,
    completedCount: user.watchedVideos.filter(v => v.completed).length
  });

  // إزالة أي تسجيل سابق لنفس الدرس (تجنب التكرار)
  user.watchedVideos = user.watchedVideos.filter(
    (v) => !(v.courseId.toString() === courseId && v.lessonId === lessonId)
  );

  // إضافة التسجيل الجديد
  user.watchedVideos.push({
    courseId,
    lessonId,
    videoUrl: videoUrl || '',
    completed: completed || false,
    watchedAt: new Date()
  });

  // تحديث آخر فيديو شاهده
  user.lastWatched = {
    courseId,
    lessonId,
    watchedAt: new Date()
  };

  await user.save();

  // حساب العدد المكتمل في هذا الكورس
  const completedCount = user.watchedVideos.filter(
    v => v.courseId.toString() === courseId && v.completed
  ).length;

  // إجمالي الدروس في الكورس
  const totalLessons = course.lessons?.length || 10;

  console.log('✅ User after update:', {
    completedCount,
    totalLessons,
    percentage: Math.round((completedCount / totalLessons) * 100)
  });

  res.status(200).json({
    message: 'Progress tracked successfully',
    watchedVideos: user.watchedVideos,
    lastWatched: user.lastWatched,
    completedCount,
    totalLessons,
    percentage: Math.round((completedCount / totalLessons) * 100)
  });
});

// ===============================
// جلب كل تقدم المستخدم
// ===============================
const getUserProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('watchedVideos lastWatched enrolledCourses')
    .populate('watchedVideos.courseId', 'title image')
    .populate('enrolledCourses.courseId', 'title image');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    watchedVideos: user.watchedVideos,
    lastWatched: user.lastWatched,
    enrolledCourses: user.enrolledCourses || []
  });
});

// ===============================
// جلب آخر فيديو شاهده المستخدم
// ===============================
const getLastWatched = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('lastWatched')
    .populate('lastWatched.courseId', 'title image');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.lastWatched || !user.lastWatched.courseId) {
    res.status(200).json({ message: 'No videos watched yet' });
    return;
  }

  res.status(200).json(user.lastWatched);
});

// ===============================
// تحديد درس كمكتمل
// ===============================
const markLessonAsCompleted = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.body;
  const userId = req.user.id;

  console.log('🎯 Marking lesson as completed:', { courseId, lessonId });

  if (!courseId || !lessonId) {
    res.status(400);
    throw new Error('courseId and lessonId are required');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // التحقق من وجود الكورس
  const course = await Course.findById(courseId).select('lessons');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  console.log('👤 Before marking completed:', {
    watchedCount: user.watchedVideos.length,
    completedBefore: user.watchedVideos.filter(v => v.courseId.toString() === courseId && v.completed).length
  });

  // البحث عن الفيديو في قائمة المشاهدات
  const videoIndex = user.watchedVideos.findIndex(
    (v) => v.courseId.toString() === courseId && v.lessonId === lessonId
  );

  if (videoIndex === -1) {
    // لو مش موجود، نضيفه جديد
    user.watchedVideos.push({
      courseId,
      lessonId,
      completed: true,
      watchedAt: new Date()
    });
    console.log('➕ Added new watched video');
  } else {
    // لو موجود، نحدثه
    user.watchedVideos[videoIndex].completed = true;
    user.watchedVideos[videoIndex].watchedAt = new Date();
    console.log('🔄 Updated existing video');
  }

  // تحديث آخر فيديو
  user.lastWatched = {
    courseId,
    lessonId,
    watchedAt: new Date()
  };

  await user.save();

  // حساب عدد الدروس المكتملة في هذا الكورس
  const completedCount = user.watchedVideos.filter(
    v => v.courseId.toString() === courseId && v.completed
  ).length;

  // إجمالي الدروس في الكورس
  const totalLessons = course.lessons?.length || 10;
  
  // حساب النسبة المئوية
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  console.log('✅ After marking completed:', {
    completedCount,
    totalLessons,
    percentage
  });

  // التحقق مما إذا كان المستخدم أكمل جميع دروس الكورس
  if (totalLessons > 0 && completedCount === totalLessons) {
    console.log('🏆 Course completed!');
    // تحديث حالة الكورس في enrolledCourses
    await User.updateOne(
      { 
        _id: userId, 
        'enrolledCourses.courseId': courseId 
      },
      { 
        $set: { 'enrolledCourses.$.completed': true } 
      }
    );
  }

  res.status(200).json({
    message: 'Lesson marked as completed',
    watchedVideos: user.watchedVideos,
    completedCount,
    totalLessons,
    percentage
  });
});

// ===============================
// جلب تقدم كورس معين
// ===============================
const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  console.log('📊 Getting course progress for:', courseId);

  const user = await User.findById(req.user.id).select('watchedVideos enrolledCourses');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const course = await Course.findById(courseId).select('lessons');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const courseVideos = user.watchedVideos.filter(
    (v) => v.courseId && v.courseId.toString() === courseId
  );

  const completedCount = courseVideos.filter(v => v.completed).length;
  const totalVideos = course.lessons?.length || 10;
  
  const isEnrolled = user.enrolledCourses?.some(
    e => e.courseId && e.courseId.toString() === courseId
  );

  console.log('📈 Course progress:', {
    completedCount,
    totalVideos,
    percentage: Math.round((completedCount / totalVideos) * 100)
  });

  res.status(200).json({
    courseId,
    isEnrolled,
    videos: courseVideos,
    completedCount,
    totalVideos,
    percentage: totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0
  });
});

module.exports = {
  trackWatchedVideo,
  getUserProgress,
  getLastWatched,
  markLessonAsCompleted,
  getCourseProgress
};