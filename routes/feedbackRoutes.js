const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const { addFeedback, getCourseFeedbacks } = require('../controllers/feedbackController');

router.post('/', protect, addFeedback);
router.get('/course/:courseId', getCourseFeedbacks);

module.exports = router;