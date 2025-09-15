import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Shield, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalAssignments: number;
  totalSubmissions: number;
}

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuthContext();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch user statistics
      const { data: users } = await supabase
        .from('profiles')
        .select('role');

      const { data: courses } = await supabase
        .from('courses')
        .select('id');

      const { data: assignments } = await supabase
        .from('assignments')
        .select('id');

      const { data: submissions } = await supabase
        .from('submissions')
        .select('id');

      const usersByRole = users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        totalUsers: users?.length || 0,
        totalStudents: usersByRole.student || 0,
        totalTeachers: usersByRole.teacher || 0,
        totalCourses: courses?.length || 0,
        totalAssignments: assignments?.length || 0,
        totalSubmissions: submissions?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Администраторски панел
        </h1>
        <p className="text-indigo-100">
          Добре дошли, {profile?.full_name}! Управлявайте цялата система
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Общо потребители</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Студенти</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Преподаватели</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTeachers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-xl">
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Курсове</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-xl">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Задания</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-teal-50 rounded-xl">
              <Activity className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Предавания</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Системно управление</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Потребители</h3>
                <p className="text-sm text-gray-500">Управление на профили</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
              <div className="p-2 bg-green-50 group-hover:bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Курсове</h3>
                <p className="text-sm text-gray-500">Преглед на всички курсове</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="p-2 bg-purple-50 group-hover:bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Анализи</h3>
                <p className="text-sm text-gray-500">Подробна статистика</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <div className="p-2 bg-orange-50 group-hover:bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Експорт данни</h3>
                <p className="text-sm text-gray-500">Изтегляне на промпти</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group">
              <div className="p-2 bg-red-50 group-hover:bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Сигурност</h3>
                <p className="text-sm text-gray-500">Настройки за достъп</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group">
              <div className="p-2 bg-teal-50 group-hover:bg-teal-100 rounded-lg">
                <Activity className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Система</h3>
                <p className="text-sm text-gray-500">Логове и мониторинг</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Състояние на системата</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-gray-900">База данни</h3>
              <p className="text-sm text-green-600">Работи нормално</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-gray-900">Файлово съхранение</h3>
              <p className="text-sm text-green-600">Работи нормално</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-gray-900">Автентикация</h3>
              <p className="text-sm text-green-600">Работи нормално</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};