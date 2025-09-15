import React, { useState } from 'react';
import { BookOpen, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподавател';
      case 'student': return 'Студент';
      default: return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Vibe-Coding Homework
              </span>
              <span className="ml-2 text-xs text-gray-500 hidden lg:block">
                От идеята до оценката – един поток, една платформа
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.full_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(profile?.role || '')}`}>
                      {getRoleName(profile?.role || '')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {profile?.full_name}
                </div>
                <div className="text-xs text-gray-500">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(profile?.role || '')}`}>
                    {getRoleName(profile?.role || '')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2 space-y-2">
              <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Bell className="h-4 w-4" />
                <span>Уведомления</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Изход</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};