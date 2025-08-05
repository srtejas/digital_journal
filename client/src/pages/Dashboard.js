import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { 
  PenTool, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  Clock,
  Target,
  Heart,
  ChevronRight
} from 'lucide-react';
import { journalApi, formatDate, generateUserId } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userId = generateUserId();
      const today = formatDate(new Date());
      const thirtyDaysAgo = formatDate(subDays(new Date(), 30));

      // Load analytics, recent entries, and today's entry in parallel
      const [analyticsResponse, entriesResponse, todayResponse] = await Promise.allSettled([
        journalApi.getAnalytics(userId, { startDate: thirtyDaysAgo, endDate: today }),
        journalApi.getEntries(userId, { limit: 5 }),
        journalApi.getEntry(userId, today)
      ]);

      if (analyticsResponse.status === 'fulfilled') {
        setAnalytics(analyticsResponse.value.analytics);
      }

      if (entriesResponse.status === 'fulfilled') {
        setRecentEntries(entriesResponse.value.entries);
      }

      if (todayResponse.status === 'fulfilled') {
        setTodayEntry(todayResponse.value.entry);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const today = formatDate(new Date());
  const hasJournaledToday = !!todayEntry;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! 👋
            </h1>
            <p className="text-gray-600">
              {hasJournaledToday 
                ? "You've already journaled today. Great job staying consistent!" 
                : "Ready to reflect on your day? Let's get started with today's journal entry."
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link 
              to="/journal" 
              className="btn-primary flex items-center space-x-2"
            >
              <PenTool className="h-5 w-5" />
              <span>{hasJournaledToday ? 'Edit Today\'s Entry' : 'Start Journaling'}</span>
            </Link>
            <Link 
              to="/analytics" 
              className="btn-secondary flex items-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span>View Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary-700">
              {analytics?.streaks?.current || 0}
            </span>
          </div>
          <h3 className="font-semibold text-primary-900 mb-1">Current Streak</h3>
          <p className="text-sm text-primary-700">Consecutive days journaling</p>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 border border-accent-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-accent-700">
              {analytics?.period?.entriesCount || 0}
            </span>
          </div>
          <h3 className="font-semibold text-accent-900 mb-1">Entries (30 days)</h3>
          <p className="text-sm text-accent-700">Total journal entries</p>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-6 border border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-secondary-600 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-secondary-700">
              {analytics?.mood?.average ? analytics.mood.average.toFixed(1) : 'N/A'}
            </span>
          </div>
          <h3 className="font-semibold text-secondary-900 mb-1">Average Mood</h3>
          <p className="text-sm text-secondary-700">
            {analytics?.mood?.trend === 'improving' ? '📈 Improving' : 
             analytics?.mood?.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-yellow-700">
              {analytics?.streaks?.completionRate || 0}%
            </span>
          </div>
          <h3 className="font-semibold text-yellow-900 mb-1">Completion Rate</h3>
          <p className="text-sm text-yellow-700">Last 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Status */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Today's Progress</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                hasJournaledToday 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center space-x-3 mb-2">
                  {hasJournaledToday ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <PenTool className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {hasJournaledToday ? 'Journal Complete' : 'Journal Pending'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(), 'MMMM do, yyyy')}
                    </p>
                  </div>
                </div>
                
                {hasJournaledToday ? (
                  <div className="text-sm text-gray-600">
                    <p>Completed at {format(new Date(todayEntry.updatedAt), 'h:mm a')}</p>
                    <p className="mt-1">
                      {todayEntry.responses.length} questions answered
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Take a few minutes to reflect on your day
                  </p>
                )}
              </div>

              <Link 
                to="/journal" 
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <PenTool className="h-5 w-5" />
                <span>{hasJournaledToday ? 'Edit Entry' : 'Start Journaling'}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Recent Insights</h2>
            </div>
            
            {analytics?.insights && analytics.insights.length > 0 ? (
              <div className="space-y-4">
                {analytics.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className={`insight-${insight.type}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {insight.type === 'positive' && '🌟'}
                        {insight.type === 'attention' && '⚠️'}
                        {insight.type === 'achievement' && '🏆'}
                        {insight.type === 'info' && 'ℹ️'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                        </p>
                        <p className="text-gray-700">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link 
                  to="/analytics" 
                  className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <span>View all insights</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Start journaling to see personalized insights about your patterns and growth!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Entries</h2>
            <Link 
              to="/history" 
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {recentEntries.length > 0 ? (
          <div className="space-y-4">
            {recentEntries.slice(0, 5).map((entry) => (
              <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(entry.date), 'MMMM do, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.responses.length} questions • {entry.metadata?.totalWordCount || 0} words
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {entry.metadata?.overallMood && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Mood</p>
                      <p className="font-medium text-gray-900">{entry.metadata.overallMood}/10</p>
                    </div>
                  )}
                  <Link 
                    to={`/journal/${formatDate(new Date(entry.date))}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No journal entries yet</p>
            <Link to="/journal" className="btn-primary">
              Create your first entry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;