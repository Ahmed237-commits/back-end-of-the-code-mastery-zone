const asyncHandler = require('express-async-handler');
const { FAQ } = require('../models');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
const getFAQs = asyncHandler(async (req, res) => {
    const faqs = await FAQ.find();
    res.json(faqs);
});

// @desc    Create an FAQ
// @route   POST /api/faqs
// @access  Public (for now)
const createFAQ = asyncHandler(async (req, res) => {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
});

module.exports = {
    getFAQs,
    createFAQ
};
