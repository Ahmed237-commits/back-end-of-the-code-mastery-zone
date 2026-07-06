const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env variables
dotenv.config();

// Connect DB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cors());
app.use(express.json());

// =======================
// Routes
// =======================
const discussionRoutes = require('./routes/discussionRoutes');
const courseRoutes = require('./routes/courseRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const faqRoutes = require('./routes/faqRoutes');
const userProgressRoutes = require('./routes/userProgressRoutes');
const enrollRoutes = require('./routes/enrollRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api/discussions', discussionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/users/progress', userProgressRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/feedback', feedbackRoutes);

// =======================
// Gemini Chatbot Route
// =======================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SITE_CONTEXT = `
You are the official AI assistant of the website "Code Mastery Zone".

About the website:
- Code Mastery Zone is an educational platform for learning programming.
- It provides structured programming courses, real-world projects, discussions, and FAQs.
- The platform focuses on helping beginners and intermediate developers.
- Topics include frontend development, backend development, full-stack projects, and coding best practices.

Rules:
- Always answer as a representative of Code Mastery Zone.
- Never ask the user for a website link.
- If the user asks about the website, explain it clearly and confidently.
- Keep answers practical, beginner-friendly, and focused on programming.
`;

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: 'Message is required' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SITE_CONTEXT}\n\nUser question: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return res.status(500).json({ reply: 'AI service error' });
    }

    const data = await response.json();
    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated.';

    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error('❌ Chat Error:', error);
    res.status(500).json({ reply: 'Error communicating with AI' });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
});