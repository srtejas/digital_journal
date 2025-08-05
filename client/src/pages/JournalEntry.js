import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Save, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { journalApi, formatDate, generateUserId } from '../services/api';
import QuestionRenderer from '../components/Journal/QuestionRenderer';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const JournalEntry = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(date || formatDate(new Date()));
  const [questions, setQuestions] = useState({ freeText: [], deterministic: [], nonDeterministic: [] });
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [existingEntry, setExistingEntry] = useState(null);

  useEffect(() => {
    loadQuestionsAndEntry();
  }, [currentDate]);

  const loadQuestionsAndEntry = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = generateUserId();
      
      // Load questions and existing entry in parallel
      const [questionsResponse, entryResponse] = await Promise.allSettled([
        journalApi.getDailyQuestions(currentDate),
        journalApi.getEntry(userId, currentDate)
      ]);

      if (questionsResponse.status === 'fulfilled') {
        setQuestions(questionsResponse.value.questions);
      } else {
        throw new Error('Failed to load questions');
      }

      if (entryResponse.status === 'fulfilled') {
        setExistingEntry(entryResponse.value.entry);
        // Pre-populate responses from existing entry
        const existingResponses = {};
        entryResponse.value.entry.responses.forEach(response => {
          existingResponses[response.questionId] = response.response;
        });
        setResponses(existingResponses);
      } else {
        // No existing entry, start fresh
        setExistingEntry(null);
        setResponses({});
      }
    } catch (err) {
      setError('Failed to load journal data. Please try again.');
      console.error('Error loading journal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveMessage('');

    try {
      const userId = generateUserId();
      
      // Prepare responses array
      const responsesArray = [];
      
      // Add all question types
      [...questions.freeText, ...questions.deterministic, ...questions.nonDeterministic].forEach(question => {
        const response = responses[question.id];
        if (response !== undefined && response !== '') {
          responsesArray.push({
            questionId: question.id,
            questionText: question.text,
            questionType: question.id.startsWith('ft_') ? 'free_text' : 
                         question.id.startsWith('det_') ? 'deterministic' : 'non_deterministic',
            response: response
          });
        }
      });

      if (responsesArray.length === 0) {
        setError('Please answer at least one question before saving.');
        return;
      }

      const entryData = {
        userId,
        date: currentDate,
        responses: responsesArray
      };

      await journalApi.saveEntry(entryData);
      setSaveMessage(existingEntry ? 'Entry updated successfully!' : 'Entry saved successfully!');
      
      // Reload to get updated metadata
      setTimeout(() => {
        loadQuestionsAndEntry();
      }, 1000);

    } catch (err) {
      setError('Failed to save entry. Please try again.');
      console.error('Error saving entry:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    if (date) {
      navigate(`/journal/${newDate}`);
    }
  };

  const getCompletionStats = () => {
    const totalQuestions = questions.freeText.length + questions.deterministic.length + questions.nonDeterministic.length;
    const answeredQuestions = Object.keys(responses).filter(key => 
      responses[key] !== undefined && responses[key] !== ''
    ).length;
    
    return { total: totalQuestions, answered: answeredQuestions };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = getCompletionStats();
  const completionPercentage = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {existingEntry ? 'Edit Journal Entry' : 'Daily Journal Entry'}
            </h1>
            <p className="text-gray-600">
              {format(new Date(currentDate), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold text-primary-600">
                {stats.answered}/{stats.total} questions
              </p>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="input-field"
                max={formatDate(new Date())}
              />
            </div>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {saveMessage && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700">{saveMessage}</p>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {/* Free Text Questions */}
        {questions.freeText.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Reflection Questions</h2>
              <p className="text-gray-600">Take your time to thoughtfully reflect on these questions.</p>
            </div>
            
            <div className="space-y-6">
              {questions.freeText.map((question, index) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={responses[question.id] || ''}
                  onChange={(value) => handleResponseChange(question.id, value)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Deterministic Questions */}
        {questions.deterministic.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Daily Metrics</h2>
              <p className="text-gray-600">Quick assessments to track your daily patterns.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions.deterministic.map((question, index) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={responses[question.id] || ''}
                  onChange={(value) => handleResponseChange(question.id, value)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Non-Deterministic Questions */}
        {questions.nonDeterministic.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Multiple Choice</h2>
              <p className="text-gray-600">Select the options that best describe your day.</p>
            </div>
            
            <div className="space-y-6">
              {questions.nonDeterministic.map((question, index) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={responses[question.id] || ''}
                  onChange={(value) => handleResponseChange(question.id, value)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleSave}
            disabled={saving || stats.answered === 0}
            className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : existingEntry ? 'Update Entry' : 'Save Entry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;