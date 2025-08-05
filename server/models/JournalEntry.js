const mongoose = require('mongoose');

const QuestionResponseSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['free_text', 'deterministic', 'non_deterministic'],
    required: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, array, etc.
    required: true
  },
  responseMetadata: {
    wordCount: Number,
    sentiment: {
      score: Number,
      comparative: Number,
      positive: [String],
      negative: [String]
    },
    keywords: [String],
    emotionalTags: [String]
  }
});

const JournalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  responses: [QuestionResponseSchema],
  metadata: {
    completionTime: Number, // in minutes
    overallMood: {
      type: Number,
      min: 1,
      max: 10
    },
    overallSentiment: {
      score: Number,
      comparative: Number
    },
    totalWordCount: Number,
    categories: {
      gratitude: Number,
      challenges: Number,
      goals: Number,
      reflection: Number,
      mood: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient date range queries
JournalEntrySchema.index({ userId: 1, date: 1 });
JournalEntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);