import React from 'react';
import { Home, BookOpen, FileText, Users, Settings, GraduationCap, ClipboardList, BarChart3 } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { profile } = useAuthContext();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', name: 'Начало', icon: Home },
    ];

    switch (profile?.role) {
      case 'student':
        return [
          ...baseItems,
          { id: 'courses', name: 'Курсове', icon: BookOpen },
          { id: 'assignments', name: 'Задания', icon: FileText },
          { id: 'submissions', name: 'Предадени', icon: ClipboardList },
        ];
      
      case 'teacher':
        return [
          ...baseItems,
          { id: 'courses', name: 'Курсове', icon: BookOpen },
          { id: 'assignments', name: 'Задания', icon: FileText },
          { id: 'submissions', name: 'Оценяване', icon: ClipboardList },
          { id: 'students', name: 'Студенти', icon: Users },
          { id: 'analytics', name: 'Анализи', icon: BarChart3 },
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { id: 'courses', name: 'Курсове', icon: BookOpen },
          { id: 'users', name: 'Потребители', icon: Users },
          { id: 'assignments', name: 'Задания', icon: FileText },
          { id: 'analytics', name: 'Анализи', icon: BarChart3 },
          { id: 'settings', name: 'Настройки', icon: Settings },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">
              {profile?.role === 'student' && 'Студентски панел'}
              {profile?.role === 'teacher' && 'Преподавателски панел'}
              {profile?.role === 'admin' && 'Администраторски панел'}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};