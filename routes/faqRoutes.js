const express = require('express');
const router = express.Router();
const { getFAQs, createFAQ } = require('../controllers/faqController');

router.route('/')
    .get(getFAQs)
    .post(createFAQ);

module.exports = router;
