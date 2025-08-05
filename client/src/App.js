import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import JournalEntry from './pages/JournalEntry';
import Analytics from './pages/Analytics';
import History from './pages/History';
import { generateUserId } from './services/api';
import './index.css';

function App() {
  // Initialize user ID on app load
  React.useEffect(() => {
    generateUserId();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/journal" element={<JournalEntry />} />
                <Route path="/journal/:date" element={<JournalEntry />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;