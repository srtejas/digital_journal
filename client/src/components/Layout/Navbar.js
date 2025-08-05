import React from 'react';
import { format } from 'date-fns';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Digital Journal</h1>
            <p className="text-sm text-gray-500">Your personal reflection companion</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-medium text-gray-700">{currentDate}</p>
          <p className="text-sm text-gray-500">Today</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;