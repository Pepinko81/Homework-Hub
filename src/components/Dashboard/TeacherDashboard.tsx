import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface DashboardStats {
  totalCourses: number;
  totalAssignments: number;
  totalStudents: number;
  pendingGrading: number;
}

interface RecentSubmission {
  id: string;
  submitted_at: string;
  student: {
    full_name: string;
  };
  assignment: {
    title: string;
    lecture: {
      course: {
        name: string;
        code: string;
      };
    };
  };
}

export const TeacherDashboard: React.FC = () => {
  const { profile } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalAssignments: 0,
    totalStudents: 0,
    pendingGrading: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('created_by', profile.id);

      // Fetch assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          id,
          lecture:lectures!inner (
            course:courses!inner (
              created_by
            )
          )
        `)
        .eq('lecture.course.created_by', profile.id);

      // Fetch students (enrolled in teacher's courses)
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select(`
          student_id,
          course:courses!inner (
            created_by
          )
        `)
        .eq('course.created_by', profile.id);

      // Fetch pending submissions
      const { data: pendingSubmissions } = await supabase
        .from('submissions')
        .select(`
          id,
          assignment:assignments!inner (
            lecture:lectures!inner (
              course:courses!inner (
                created_by
              )
            )
          )
        `)
        .eq('assignment.lecture.course.created_by', profile.id)
        .is('grade', null);

      // Fetch recent submissions
      const { data: recent } = await supabase
        .from('submissions')
        .select(`
          id,
          submitted_at,
          student:profiles!submissions_student_id_fkey (
            full_name
          ),
          assignment:assignments!inner (
            title,
            lecture:lectures!inner (
              course:courses!inner (
                name,
                code,
                created_by
              )
            )
          )
        `)
        .eq('assignment.lecture.course.created_by', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(5);

      setStats({
        totalCourses: courses?.length || 0,
        totalAssignments: assignments?.length || 0,
        totalStudents: new Set(enrollments?.map(e => e.student_id)).size || 0,
        pendingGrading: pendingSubmissions?.length || 0,
      });

      setRecentSubmissions(recent || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Преподавателски панел
        </h1>
        <p className="text-purple-100">
          Добре дошли, {profile?.full_name}! Управлявайте курсовете и оценявайте студентите
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Курсове</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Задания</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Студенти</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">За оценяване</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Скорошни предавания</h2>
          </div>
          <div className="p-6">
            {recentSubmissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Няма скорошни предавания</p>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-1 bg-blue-50 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {submission.assignment.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        от {submission.student.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {submission.assignment.lecture.course.code} - {submission.assignment.lecture.course.name}
                      </p>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(submission.submitted_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Бързи действия</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50 transition-colors group">
                <div className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Създай ново задание</h3>
                  <p className="text-sm text-gray-500">Добави задание към курс</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-green-50 transition-colors group">
                <div className="p-2 bg-green-50 group-hover:bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Оцени предавания</h3>
                  <p className="text-sm text-gray-500">{stats.pendingGrading} чакащи за оценяване</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-purple-50 transition-colors group">
                <div className="p-2 bg-purple-50 group-hover:bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Управлявай курсове</h3>
                  <p className="text-sm text-gray-500">Редактирай курсове и лекции</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-orange-50 transition-colors group">
                <div className="p-2 bg-orange-50 group-hover:bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Преглед на анализи</h3>
                  <p className="text-sm text-gray-500">Статистики и прогрес</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};