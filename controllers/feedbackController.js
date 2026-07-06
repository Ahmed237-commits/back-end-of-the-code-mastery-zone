const asyncHandler = require('express-async-handler');
const { Feedback, Course } = require('../models');

// إضافة تقييم جديد
const addFeedback = asyncHandler(async (req, res) => {
  const { courseId, rating, comment, tags, isAnonymous } = req.body;
  const userId = req.user?.id;
  const userName = req.user?.name;
  const userAvatar = req.user?.avatar;

  if (!courseId || !rating) {
    res.status(400);
    throw new Error('Course ID and rating are required');
  }

  const feedback = await Feedback.create({
    courseId,
    userId: isAnonymous ? null : userId,
    userName: isAnonymous ? null : userName,
    userAvatar: isAnonymous ? null : userAvatar,
    rating,
    comment,
    tags,
    isAnonymous
  });

  // تحديث متوسط التقييم للكورس
  const feedbacks = await Feedback.find({ courseId, isApproved: true });
  const totalRatings = feedbacks.length;
  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings;

  await Course.findByIdAndUpdate(courseId, {
    averageRating: averageRating.toFixed(1),
    totalRatings
  });

  res.status(201).json({ message: 'Feedback submitted successfully', feedback });
});

// جلب تقييمات الكورس
const getCourseFeedbacks = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const feedbacks = await Feedback.find({ courseId, isApproved: true })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(feedbacks);
});

module.exports = { addFeedback, getCourseFeedbacks };