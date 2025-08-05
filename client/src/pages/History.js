import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { journalApi, formatDate, generateUserId } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const History = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [startDate, endDate]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const userId = generateUserId();
      const params = {};
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await journalApi.getEntries(userId, params);
      setEntries(response.entries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId, date) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        const userId = generateUserId();
        await journalApi.deleteEntry(userId, formatDate(new Date(date)));
        setEntries(entries.filter(entry => entry._id !== entryId));
        setShowModal(false);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const dateMatch = format(new Date(entry.date), 'MMMM do, yyyy').toLowerCase().includes(searchLower);
    const contentMatch = entry.responses.some(response => 
      response.response && response.response.toString().toLowerCase().includes(searchLower)
    );
    
    return dateMatch || contentMatch;
  });

  const EntryModal = ({ entry, onClose }) => {
    if (!entry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {format(new Date(entry.date), 'MMMM do, yyyy')}
                </h2>
                <p className="text-gray-600">
                  {entry.responses.length} questions • {entry.metadata?.totalWordCount || 0} words
                </p>
              </div>
              <div className="flex space-x-2">
                <Link 
                  to={`/journal/${formatDate(new Date(entry.date))}`}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <button 
                  onClick={() => handleDeleteEntry(entry._id, entry.date)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
                <button 
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {entry.metadata?.overallMood && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Overall Mood</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-blue-600">{entry.metadata.overallMood}/10</div>
                  <div className="flex-1">
                    <div className="w-full bg-blue-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(entry.metadata.overallMood / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {entry.responses.map((response, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    {response.questionType === 'free_text' && <BookOpen className="h-5 w-5 text-primary-600" />}
                    {response.questionType === 'deterministic' && <Calendar className="h-5 w-5 text-accent-600" />}
                    {response.questionType === 'non_deterministic' && <Filter className="h-5 w-5 text-secondary-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{response.questionText}</h4>
                    <div className="text-gray-700">
                      {response.questionType === 'free_text' && (
                        <div className="whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                          {response.response}
                        </div>
                      )}
                      {response.questionType === 'deterministic' && (
                        <div className="font-medium">
                          {typeof response.response === 'boolean' 
                            ? (response.response ? 'Yes' : 'No')
                            : response.response
                          }
                        </div>
                      )}
                      {response.questionType === 'non_deterministic' && (
                        <div className="font-medium">
                          {Array.isArray(response.response) 
                            ? response.response.join(', ')
                            : response.response
                          }
                        </div>
                      )}
                    </div>
                    
                    {response.responseMetadata?.keywords && response.responseMetadata.keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {response.responseMetadata.keywords.map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal History</h1>
            <p className="text-gray-600">Browse and search through your past entries</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              placeholder="Start date"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          {searchTerm || startDate || endDate ? (
            <p>Showing {filteredEntries.length} of {entries.length} entries</p>
          ) : (
            <p>Total: {entries.length} entries</p>
          )}
        </div>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {format(new Date(entry.date), 'EEEE, MMMM do, yyyy')}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {entry.responses.length} questions answered • {entry.metadata?.totalWordCount || 0} words
                    </p>
                    
                    {/* Entry Preview */}
                    <div className="text-sm text-gray-700">
                      {entry.responses
                        .filter(r => r.questionType === 'free_text')
                        .slice(0, 1)
                        .map((response, idx) => (
                          <p key={idx} className="truncate">
                            "{response.response.substring(0, 100)}..."
                          </p>
                        ))
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {entry.metadata?.overallMood && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Mood</p>
                      <p className="text-lg font-semibold text-primary-600">
                        {entry.metadata.overallMood}/10
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowModal(true);
                      }}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    <Link 
                      to={`/journal/${formatDate(new Date(entry.date))}`}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || startDate || endDate ? 'No entries found' : 'No journal entries yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || startDate || endDate 
              ? 'Try adjusting your search criteria or date range.'
              : 'Start your journaling journey by creating your first entry.'
            }
          </p>
          {!(searchTerm || startDate || endDate) && (
            <Link to="/journal" className="btn-primary">
              Create your first entry
            </Link>
          )}
        </div>
      )}

      {/* Entry Detail Modal */}
      {showModal && (
        <EntryModal 
          entry={selectedEntry} 
          onClose={() => {
            setShowModal(false);
            setSelectedEntry(null);
          }} 
        />
      )}
    </div>
  );
};

export default History;