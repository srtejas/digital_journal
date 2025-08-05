import React, { useState, useEffect } from 'react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { journalApi, formatDate, generateUserId } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate;

    switch (dateRange) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case '1y':
        startDate = subMonths(endDate, 12);
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : subDays(endDate, 30);
        if (customEndDate) {
          endDate.setTime(new Date(customEndDate).getTime());
        }
        break;
      default:
        startDate = subDays(endDate, 30);
    }

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const userId = generateUserId();
      const { startDate, endDate } = getDateRange();
      
      const response = await journalApi.getAnalytics(userId, { startDate, endDate });
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights into your journaling patterns and personal growth</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            
            {dateRange === 'custom' && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="input-field"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            )}
            
            <button 
              onClick={loadAnalytics}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Period Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">{analytics?.period?.entriesCount || 0}</p>
              <p className="text-sm text-gray-600">Total Entries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-600">{analytics?.period?.totalDays || 0}</p>
              <p className="text-sm text-gray-600">Days in Period</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-600">{analytics?.streaks?.current || 0}</p>
              <p className="text-sm text-gray-600">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{analytics?.streaks?.completionRate || 0}%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Mood Trend</h2>
            <p className="text-gray-600">Daily mood tracking over time</p>
          </div>
          
          {analytics?.mood?.dailyData && analytics.mood.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.mood.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis domain={[1, 10]} />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMMM do, yyyy')}
                  formatter={(value) => [value, 'Mood']}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No mood data available for this period
            </div>
          )}
        </div>

        {/* Mood Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Mood Distribution</h2>
            <p className="text-gray-600">How often you experience different mood ranges</p>
          </div>
          
          {analytics?.mood?.distribution && Object.keys(analytics.mood.distribution).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.mood.distribution).map(([range, count]) => ({
                    name: range,
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(analytics.mood.distribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No mood distribution data available
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Journal Categories</h2>
            <p className="text-gray-600">Topics you write about most</p>
          </div>
          
          {analytics?.categories && Object.keys(analytics.categories).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analytics.categories).map(([category, data]) => ({
                name: category.charAt(0).toUpperCase() + category.slice(1),
                total: data.total || 0,
                frequency: data.frequency || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>

        {/* Patterns & Insights */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Key Insights</h2>
          </div>
          
          <div className="space-y-4">
            {analytics?.insights && analytics.insights.length > 0 ? (
              analytics.insights.map((insight, index) => (
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
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {insight.confidence}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Keep journaling to unlock personalized insights!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sleep Patterns */}
        {analytics?.patterns?.sleepCorrelations && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Sleep & Mood</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Sleep:</span>
                <span className="font-medium">{analytics.patterns.sleepCorrelations.averageSleep}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correlation:</span>
                <span className={`font-medium ${
                  analytics.patterns.sleepCorrelations.correlation === 'positive' 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {analytics.patterns.sleepCorrelations.correlation === 'positive' ? '✓ Positive' : '⚠ Needs attention'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Impact */}
        {analytics?.patterns?.exerciseImpact && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Exercise Impact</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Exercise Days:</span>
                <span className="font-medium">{analytics.patterns.exerciseImpact.exerciseDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mood w/ Exercise:</span>
                <span className="font-medium text-green-600">{analytics.patterns.exerciseImpact.avgMoodWithExercise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mood w/o Exercise:</span>
                <span className="font-medium text-red-600">{analytics.patterns.exerciseImpact.avgMoodWithoutExercise}</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Keywords */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics?.keywords && analytics.keywords.length > 0 ? (
              analytics.keywords.slice(0, 15).map((keyword, index) => (
                <span 
                  key={keyword} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No keywords available</p>
            )}
          </div>
        </div>
      </div>

      {/* Most Productive Days */}
      {analytics?.patterns?.mostProductiveDays && analytics.patterns.mostProductiveDays.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Most Productive Days</h2>
            <p className="text-gray-600">Days of the week when you feel most productive</p>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.patterns.mostProductiveDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toFixed(1), 'Average Productivity']} />
              <Bar dataKey="average" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emotional Patterns */}
      {analytics?.patterns?.emotionalPatterns && analytics.patterns.emotionalPatterns.mostCommon.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Emotional Patterns</h2>
            <p className="text-gray-600">Your most common emotions over time</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {analytics.patterns.emotionalPatterns.mostCommon.map((emotion, index) => (
              <div key={emotion.emotion} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{emotion.percentage}%</p>
                <p className="text-sm font-medium text-gray-900">{emotion.emotion}</p>
                <p className="text-xs text-gray-600">{emotion.count} times</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;