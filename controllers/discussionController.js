const asyncHandler = require('express-async-handler');
const { Discussion, User } = require('../models');


// ===============================
// Get All Discussions
// ===============================
exports.getDiscussions = asyncHandler(async (req, res) => {

  const discussions = await Discussion.find()
    .populate('theuser', 'name avatar')
    .sort({ createdAt: -1 })
    .select('-likedBy');

  res.json(discussions);

});


// ===============================
// Get Single Discussion
// ===============================
exports.getDiscussionById = asyncHandler(async (req, res) => {

  const discussion = await Discussion.findById(req.params.id)
    .populate('theuser', 'name avatar')
    .populate('comments.user', 'name avatar');

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  res.json(discussion);

});


// ===============================
// Create Discussion
// ===============================
exports.createDiscussion = asyncHandler(async (req, res) => {

  const { title, content, category, tags } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const discussion = await Discussion.create({
    title,
    content,
    category,
    tags,
    theuser: req.user.id
  });

  res.status(201).json(discussion);

});


// ===============================
// Toggle Like
// ===============================
exports.toggleLike = asyncHandler(async (req, res) => {

  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const userId = req.user.id;

  const alreadyLiked = discussion.likedBy.includes(userId);

  if (alreadyLiked) {

    discussion.likedBy.pull(userId);
    discussion.likes -= 1;

    await User.findByIdAndUpdate(userId, {
      $inc: { discussionlikes: -1 }
    });

  } else {

    discussion.likedBy.push(userId);
    discussion.likes += 1;

    await User.findByIdAndUpdate(userId, {
      $inc: { discussionlikes: 1 }
    });

  }

  await discussion.save();

  res.json({
    likes: discussion.likes,
    liked: !alreadyLiked
  });

});


// ===============================
// Add Comment
// ===============================
exports.addComment = asyncHandler(async (req, res) => {

  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Comment content required');
  }

  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const comment = {
    user: req.user.id,
    content,
    createdAt: new Date()
  };

  discussion.comments.push(comment);

  await discussion.save();

  await User.findByIdAndUpdate(req.user.id, {
    $inc: { numberOfDiscussionComments: 1 }
  });

  res.json({
    comments: discussion.comments.length,
    comment
  });

});


// ===============================
// Get Comments
// ===============================
exports.getComments = asyncHandler(async (req, res) => {

  const discussion = await Discussion.findById(req.params.id)
    .populate('comments.user', 'name avatar')
    .select('comments');

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  res.json(discussion.comments);

});