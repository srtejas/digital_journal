const Sentiment = require('sentiment');
const natural = require('natural');
const moment = require('moment');

const sentiment = new Sentiment();

class AnalyticsService {
  
  // Analyze sentiment of text responses
  static analyzeSentiment(text) {
    const result = sentiment.analyze(text);
    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative
    };
  }

  // Extract keywords from text
  static extractKeywords(text, limit = 10) {
    const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
    const stopwords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their']);
    
    const filteredTokens = tokens.filter(token => 
      token.length > 2 && 
      !stopwords.has(token) && 
      /^[a-zA-Z]+$/.test(token)
    );

    const frequency = {};
    filteredTokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  // Generate analytics for a date range
  static async generateAnalytics(entries, startDate, endDate) {
    if (!entries || entries.length === 0) {
      return this.getEmptyAnalytics(startDate, endDate);
    }

    const analytics = {
      period: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        totalDays: moment(endDate).diff(moment(startDate), 'days') + 1,
        entriesCount: entries.length
      },
      mood: this.analyzeMoodTrends(entries),
      sentiment: this.analyzeSentimentTrends(entries),
      categories: this.analyzeCategoryTrends(entries),
      patterns: this.analyzePatterns(entries),
      keywords: this.analyzeTopKeywords(entries),
      streaks: this.analyzeStreaks(entries, startDate, endDate),
      insights: []
    };

    // Generate insights
    analytics.insights = this.generateInsights(analytics, entries);
    
    return analytics;
  }

  static analyzeMoodTrends(entries) {
    const moodData = entries.map(entry => ({
      date: moment(entry.date).format('YYYY-MM-DD'),
      mood: entry.metadata?.overallMood || null,
      energy: this.getResponseValue(entry, 'det_energy_level'),
      stress: this.getResponseValue(entry, 'det_stress_level')
    })).filter(item => item.mood !== null);

    if (moodData.length === 0) return { average: null, trend: null, distribution: {} };

    const average = moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length;
    
    // Calculate trend (simple linear regression slope)
    const n = moodData.length;
    const sumX = moodData.reduce((sum, _, index) => sum + index, 0);
    const sumY = moodData.reduce((sum, item) => sum + item.mood, 0);
    const sumXY = moodData.reduce((sum, item, index) => sum + index * item.mood, 0);
    const sumXX = moodData.reduce((sum, _, index) => sum + index * index, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Distribution
    const distribution = moodData.reduce((dist, item) => {
      const range = this.getMoodRange(item.mood);
      dist[range] = (dist[range] || 0) + 1;
      return dist;
    }, {});

    return {
      average: Math.round(average * 100) / 100,
      trend: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
      trendValue: slope,
      distribution,
      dailyData: moodData
    };
  }

  static analyzeSentimentTrends(entries) {
    const sentimentData = entries.map(entry => ({
      date: moment(entry.date).format('YYYY-MM-DD'),
      sentiment: entry.metadata?.overallSentiment?.comparative || 0
    }));

    const average = sentimentData.reduce((sum, item) => sum + item.sentiment, 0) / sentimentData.length;
    
    return {
      average: Math.round(average * 1000) / 1000,
      classification: average > 0.1 ? 'positive' : average < -0.1 ? 'negative' : 'neutral',
      dailyData: sentimentData
    };
  }

  static analyzeCategoryTrends(entries) {
    const categories = ['gratitude', 'challenges', 'goals', 'reflection', 'mood'];
    const categoryData = {};

    categories.forEach(category => {
      const values = entries.map(entry => 
        entry.metadata?.categories?.[category] || 0
      );
      
      categoryData[category] = {
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        total: values.reduce((sum, val) => sum + val, 0),
        frequency: values.filter(val => val > 0).length
      };
    });

    return categoryData;
  }

  static analyzePatterns(entries) {
    const patterns = {
      mostProductiveDays: this.findMostProductiveDays(entries),
      sleepCorrelations: this.analyzeSleepCorrelations(entries),
      exerciseImpact: this.analyzeExerciseImpact(entries),
      emotionalPatterns: this.analyzeEmotionalPatterns(entries)
    };

    return patterns;
  }

  static analyzeTopKeywords(entries, limit = 20) {
    const allText = entries.flatMap(entry => 
      entry.responses
        .filter(response => response.questionType === 'free_text')
        .map(response => response.response)
    ).join(' ');

    return this.extractKeywords(allText, limit);
  }

  static analyzeStreaks(entries, startDate, endDate) {
    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = moment();
    let currentDate = moment(endDate);
    
    // Count backwards from end date to find current streak
    while (currentDate.isSameOrAfter(moment(startDate))) {
      const hasEntry = sortedEntries.some(entry => 
        moment(entry.date).isSame(currentDate, 'day')
      );
      
      if (hasEntry) {
        if (currentDate.isSame(today, 'day') || currentDate.isSame(today.clone().subtract(1, 'day'), 'day')) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === 0) {
          // If we haven't started counting current streak, reset it
        } else {
          break; // Current streak is broken
        }
        tempStreak = 0;
      }
      
      currentDate.subtract(1, 'day');
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      completionRate: Math.round((entries.length / moment(endDate).diff(moment(startDate), 'days') + 1) * 100)
    };
  }

  static generateInsights(analytics, entries) {
    const insights = [];

    // Mood insights
    if (analytics.mood.trend === 'improving') {
      insights.push({
        type: 'positive',
        category: 'mood',
        message: `Your mood has been trending upward! Average mood improved by ${Math.abs(analytics.mood.trendValue * 10).toFixed(1)} points over this period.`,
        confidence: 'high'
      });
    } else if (analytics.mood.trend === 'declining') {
      insights.push({
        type: 'attention',
        category: 'mood',
        message: `Your mood has been declining recently. Consider reviewing your self-care practices and reaching out for support if needed.`,
        confidence: 'high'
      });
    }

    // Sentiment insights
    if (analytics.sentiment.classification === 'positive') {
      insights.push({
        type: 'positive',
        category: 'sentiment',
        message: `Your journal entries show consistently positive sentiment. Keep up the great mindset!`,
        confidence: 'medium'
      });
    }

    // Streak insights
    if (analytics.streaks.current >= 7) {
      insights.push({
        type: 'achievement',
        category: 'consistency',
        message: `Amazing! You've maintained a ${analytics.streaks.current}-day journaling streak. Consistency is key to self-reflection.`,
        confidence: 'high'
      });
    }

    // Keywords insights
    if (analytics.keywords.includes('grateful') || analytics.keywords.includes('thankful')) {
      insights.push({
        type: 'positive',
        category: 'gratitude',
        message: `Gratitude appears frequently in your entries. This positive practice is linked to better mental health and life satisfaction.`,
        confidence: 'medium'
      });
    }

    return insights;
  }

  // Helper methods
  static getResponseValue(entry, questionId) {
    const response = entry.responses.find(r => r.questionId === questionId);
    return response ? response.response : null;
  }

  static getMoodRange(mood) {
    if (mood <= 3) return 'Low (1-3)';
    if (mood <= 6) return 'Medium (4-6)';
    if (mood <= 8) return 'Good (7-8)';
    return 'Excellent (9-10)';
  }

  static findMostProductiveDays(entries) {
    const dayProductivity = {};
    
    entries.forEach(entry => {
      const dayOfWeek = moment(entry.date).format('dddd');
      const productivity = this.getResponseValue(entry, 'det_productivity');
      
      if (productivity) {
        if (!dayProductivity[dayOfWeek]) {
          dayProductivity[dayOfWeek] = { total: 0, count: 0 };
        }
        dayProductivity[dayOfWeek].total += productivity;
        dayProductivity[dayOfWeek].count += 1;
      }
    });

    const averages = Object.entries(dayProductivity).map(([day, data]) => ({
      day,
      average: data.total / data.count
    })).sort((a, b) => b.average - a.average);

    return averages.slice(0, 3);
  }

  static analyzeSleepCorrelations(entries) {
    const sleepMoodData = entries.map(entry => ({
      sleep: this.getResponseValue(entry, 'det_sleep_hours'),
      sleepQuality: this.getResponseValue(entry, 'det_sleep_quality'),
      mood: entry.metadata?.overallMood
    })).filter(item => item.sleep && item.mood);

    if (sleepMoodData.length < 3) return null;

    // Simple correlation between sleep and mood
    const avgSleep = sleepMoodData.reduce((sum, item) => sum + item.sleep, 0) / sleepMoodData.length;
    const avgMood = sleepMoodData.reduce((sum, item) => sum + item.mood, 0) / sleepMoodData.length;

    return {
      optimalSleepRange: sleepMoodData
        .filter(item => item.mood >= 7)
        .map(item => item.sleep)
        .sort((a, b) => a - b),
      averageSleep: Math.round(avgSleep * 10) / 10,
      correlation: avgSleep > 7 && avgMood > 6 ? 'positive' : 'needs_attention'
    };
  }

  static analyzeExerciseImpact(entries) {
    const exerciseDays = entries.filter(entry => this.getResponseValue(entry, 'det_exercise') === true);
    const nonExerciseDays = entries.filter(entry => this.getResponseValue(entry, 'det_exercise') === false);

    if (exerciseDays.length === 0 || nonExerciseDays.length === 0) return null;

    const avgMoodExercise = exerciseDays.reduce((sum, entry) => sum + (entry.metadata?.overallMood || 0), 0) / exerciseDays.length;
    const avgMoodNoExercise = nonExerciseDays.reduce((sum, entry) => sum + (entry.metadata?.overallMood || 0), 0) / nonExerciseDays.length;

    return {
      exerciseDays: exerciseDays.length,
      avgMoodWithExercise: Math.round(avgMoodExercise * 100) / 100,
      avgMoodWithoutExercise: Math.round(avgMoodNoExercise * 100) / 100,
      impact: avgMoodExercise > avgMoodNoExercise ? 'positive' : 'neutral'
    };
  }

  static analyzeEmotionalPatterns(entries) {
    const emotions = entries.map(entry => this.getResponseValue(entry, 'nd_primary_emotion'))
      .filter(emotion => emotion);

    const emotionCounts = emotions.reduce((counts, emotion) => {
      counts[emotion] = (counts[emotion] || 0) + 1;
      return counts;
    }, {});

    const sortedEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      mostCommon: sortedEmotions.map(([emotion, count]) => ({ emotion, count, percentage: Math.round((count / emotions.length) * 100) })),
      totalTracked: emotions.length
    };
  }

  static getEmptyAnalytics(startDate, endDate) {
    return {
      period: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        totalDays: moment(endDate).diff(moment(startDate), 'days') + 1,
        entriesCount: 0
      },
      mood: { average: null, trend: null, distribution: {} },
      sentiment: { average: null, classification: 'neutral', dailyData: [] },
      categories: {},
      patterns: {},
      keywords: [],
      streaks: { current: 0, longest: 0, completionRate: 0 },
      insights: [{
        type: 'info',
        category: 'general',
        message: 'Start journaling to see your personal analytics and insights!',
        confidence: 'high'
      }]
    };
  }
}

module.exports = AnalyticsService;