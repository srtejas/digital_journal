const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const moment = require('moment');
require('dotenv').config();

const JournalEntry = require('./models/JournalEntry');
const AnalyticsService = require('./services/analyticsService');
const { getDailyQuestionSet } = require('./config/dailyQuestions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-journal';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Helper function to process entry metadata
const processEntryMetadata = (responses) => {
  const metadata = {
    totalWordCount: 0,
    overallSentiment: { score: 0, comparative: 0 },
    categories: {
      gratitude: 0,
      challenges: 0,
      goals: 0,
      reflection: 0,
      mood: 0
    }
  };

  let totalSentimentScore = 0;
  let totalSentimentComparative = 0;
  let sentimentCount = 0;

  responses.forEach(response => {
    // Process free text responses
    if (response.questionType === 'free_text' && response.response) {
      const text = response.response.toString();
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      metadata.totalWordCount += wordCount;

      // Analyze sentiment
      const sentiment = AnalyticsService.analyzeSentiment(text);
      totalSentimentScore += sentiment.score;
      totalSentimentComparative += sentiment.comparative;
      sentimentCount++;

      // Extract keywords and emotional tags
      response.responseMetadata = {
        wordCount,
        sentiment,
        keywords: AnalyticsService.extractKeywords(text, 5),
        emotionalTags: [] // Could be expanded with emotion detection
      };

      // Categorize based on question category
      const category = response.questionText.toLowerCase();
      if (category.includes('grateful') || category.includes('gratitude')) {
        metadata.categories.gratitude += sentiment.score > 0 ? 2 : 1;
      } else if (category.includes('challenge') || category.includes('difficult')) {
        metadata.categories.challenges += 1;
      } else if (category.includes('goal') || category.includes('tomorrow') || category.includes('improve')) {
        metadata.categories.goals += 1;
      } else {
        metadata.categories.reflection += 1;
      }
    }

    // Process mood-related responses
    if (response.questionId === 'det_mood_scale') {
      metadata.overallMood = parseInt(response.response);
      metadata.categories.mood += 1;
    }
  });

  // Calculate overall sentiment
  if (sentimentCount > 0) {
    metadata.overallSentiment = {
      score: totalSentimentScore / sentimentCount,
      comparative: totalSentimentComparative / sentimentCount
    };
  }

  return metadata;
};

// Routes

// Get daily questions for a specific date
app.get('/api/questions/:date?', (req, res) => {
  try {
    const date = req.params.date ? new Date(req.params.date) : new Date();
    const questions = getDailyQuestionSet(date);
    
    res.json({
      success: true,
      date: moment(date).format('YYYY-MM-DD'),
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily questions',
      error: error.message
    });
  }
});

// Create or update journal entry
app.post('/api/entries', async (req, res) => {
  try {
    const { userId, date, responses } = req.body;

    if (!userId || !date || !responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, date, and responses array'
      });
    }

    // Process metadata
    const metadata = processEntryMetadata(responses);

    // Check if entry already exists for this date
    const existingEntry = await JournalEntry.findOne({
      userId,
      date: moment(date).startOf('day').toDate()
    });

    let entry;
    if (existingEntry) {
      // Update existing entry
      existingEntry.responses = responses;
      existingEntry.metadata = metadata;
      existingEntry.updatedAt = new Date();
      entry = await existingEntry.save();
    } else {
      // Create new entry
      entry = new JournalEntry({
        userId,
        date: moment(date).startOf('day').toDate(),
        responses,
        metadata
      });
      entry = await entry.save();
    }

    res.json({
      success: true,
      message: existingEntry ? 'Entry updated successfully' : 'Entry created successfully',
      entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving journal entry',
      error: error.message
    });
  }
});

// Get journal entries for a user with optional date range
app.get('/api/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;

    let query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = moment(startDate).startOf('day').toDate();
      if (endDate) query.date.$lte = moment(endDate).endOf('day').toDate();
    }

    const entries = await JournalEntry
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      entries,
      count: entries.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entries',
      error: error.message
    });
  }
});

// Get specific journal entry by date
app.get('/api/entries/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    const entry = await JournalEntry.findOne({
      userId,
      date: moment(date).startOf('day').toDate()
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No journal entry found for this date'
      });
    }

    res.json({
      success: true,
      entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entry',
      error: error.message
    });
  }
});

// Get analytics for a user within a date range
app.get('/api/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate = moment().format('YYYY-MM-DD')
    } = req.query;

    // Fetch entries within date range
    const entries = await JournalEntry.find({
      userId,
      date: {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      }
    }).sort({ date: 1 });

    // Generate analytics
    const analytics = await AnalyticsService.generateAnalytics(
      entries,
      startDate,
      endDate
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating analytics',
      error: error.message
    });
  }
});

// Delete journal entry
app.delete('/api/entries/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    const entry = await JournalEntry.findOneAndDelete({
      userId,
      date: moment(date).startOf('day').toDate()
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No journal entry found for this date'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting journal entry',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Journal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Digital Journal API server running on port ${PORT}`);
});