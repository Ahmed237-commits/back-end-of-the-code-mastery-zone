const express = require('express');
const router = express.Router();

const {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  toggleLike,
  addComment
} = require('../controllers/discussionController');

const { protect } = require('../middleware/authmiddleware');

router
  .route('/')
  .get(getDiscussions)
  .post(protect, createDiscussion);

router
  .route('/:id')
  .get(getDiscussionById);

router
  .route('/:id/like')
  .put(protect, toggleLike);

router
  .route('/:id/comments')
  .post(protect, addComment);

module.exports = router;