// models/index.js

const mongoose = require('mongoose');
const localizedStringSchema = require("./localizedString");
// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      },
    },
    salt: {
      type: String,
      required: function () {
        return !!this.password;
      },
    },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    oauthProvider: { type: String },
    createdAt: { type: Date, default: Date.now },
    discussionlikes: { type: Number, default: 0 },
    numberOfDiscussionComments: { type: Number, default: 0 },
    discussionComments: [
      {
        discussionId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion" },
        content: String,
        createdAt: Date
      }
    ],
    projectlikes: { type: Number, default: 0 },
    numberOfProjectComments: { type: Number, default: 0 },
    projectComments: { type: Array, default: [] },
    watchedVideos: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        lessonId: String,
        videoUrl: String,
        watchedAt: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false }
      }
    ],
    lastWatched: {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      lessonId: String,
      watchedAt: Date
    },
    enrolledCourses: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        enrolledAt: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false }
      }
    ],
});

// ✅ إضافة Schema التقييمات
const feedbackSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userName: { type: String, required: false },
  userAvatar: { type: String, required: false },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  tags: [{ type: String }],
  isAnonymous: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Discussion Schema
const discussionSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    category: { type: String, required: true },
    tags: [String],
    theuser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});
const courseSchema = new mongoose.Schema({
    title: {
        type: localizedStringSchema,
        required: true,
        unique: true,
    },

    description: {
        type: localizedStringSchema,
        required: true,
    },

    image: {
        type: String,
        required: true,
    },

    tag: {
        type: String,
        required: true,
    },

    duration: {
        type: localizedStringSchema,
        required: true,
    },

    ageGroup: {
        type: String,
        required: true,
    },

    price: {
        type: localizedStringSchema,
        default: {
            ar: "مجاني",
            en: "Free",
        },
    },

    lessons: [
        {
            title: {
                type: localizedStringSchema,
                required: true,
            },

            content: {
                type: localizedStringSchema,
                required: true,
            },

            videoUrl: String,
        },
    ],

    studentsCount: {
        type: Number,
        default: 0,
    },

    averageRating: {
        type: Number,
        default: 0,
    },

    totalRatings: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// FAQ Schema
const faqSchema = new mongoose.Schema({
    question: {
        type: localizedStringSchema,
        required: true,
    },

    answer: {
        type: localizedStringSchema,
        required: true,
    },

    category: {
        type: String,
        default: "General",
    },
});
// Project/Showcase Schema
const projectSchema = new mongoose.Schema({
    title: {
        type: localizedStringSchema,
        required: true,
    },

    description: {
        type: localizedStringSchema,
        required: true,
    },

    imageUrl: String,

    demoUrl: String,

    repoUrl: String,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    tags: [String],

    likes: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const User = mongoose.model('theuser', userSchema);
const Discussion = mongoose.model('Discussion', discussionSchema);
const Course = mongoose.model('Course', courseSchema);
const FAQ = mongoose.model('FAQ', faqSchema);
const Project = mongoose.model('Project', projectSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = {
    User,
    Discussion,
    Course,
    FAQ,
    Project,
    Feedback
};