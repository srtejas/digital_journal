import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  PenTool, 
  BarChart3, 
  History, 
  Calendar,
  TrendingUp,
  User
} from 'lucide-react';

const Sidebar = () => {
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and quick access'
    },
    {
      name: 'Today\'s Journal',
      href: '/journal',
      icon: PenTool,
      description: 'Write your daily entry'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Insights and trends'
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      description: 'Past entries'
    }
  ];

  return (
    <aside className="fixed left-0 top-16 h-screen w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <User className="h-10 w-10 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Welcome back!</p>
              <p className="text-sm text-gray-500">Ready to reflect?</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs opacity-75">{item.description}</p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-12 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <p className="font-medium text-gray-900">Daily Streak</p>
          </div>
          <p className="text-2xl font-bold text-primary-600">🔥 0</p>
          <p className="text-xs text-gray-600">Start journaling to build your streak!</p>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <p className="font-medium text-gray-900">Quick Tip</p>
          </div>
          <p className="text-sm text-gray-700">
            Consistency is key! Try to journal at the same time each day.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;