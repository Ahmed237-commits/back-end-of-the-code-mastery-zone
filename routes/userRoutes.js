// routes/userRoutes.js
const express = require('express'); // ✅ تم تصحيح exress
const router = express.Router();    // ✅ تم تصحيح Routerp
const { protect } = require('../middleware/authmiddleware');
const {
  registerUser,
  loginUser,
  oauthLogin,
  getUserByEmail,
  getUserById,
  getCurrentUser,
  // getUserProgress // 💡 لو دالة البروجرس متعرفة في الكنترولر ده فك الكومنت عنها
} = require("../controllers/userController");

// المسارات العامة
router.post('/', registerUser);               // POST /api/users
router.post('/login', loginUser);             // POST /api/users/login
router.get('/email/:email', getUserByEmail);   // GET /api/users/email/:email
router.post("/oauth", oauthLogin);

// المسارات المحمية (تحتاج مصادقة)
router.get('/me', protect, getCurrentUser);   // GET /api/users/me

// 💡 القفشة هنا: لازم أي مسار ثابت زي progress يتكتب قَبْلَ الـ :id الديناميكي
// لو مسار الـ progress الكود بتاعه في الملف ده، فك الكومنت عن السطر اللي تحت:
// router.get('/progress/course/:courseId', protect, getUserProgress);

// المسار الديناميكي في الآخر خالص عشان ما يشفطش باقي المسارات
router.get('/:id', protect, getUserById);       // GET /api/users/:id

module.exports = router;