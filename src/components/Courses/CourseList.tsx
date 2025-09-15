import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, Calendar, Search, Filter } from 'lucide-react';
import { supabase, Course } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { CreateCourseModal } from './CreateCourseModal';

interface CourseWithStats extends Course {
  student_count?: number;
  assignment_count?: number;
}

export const CourseList: React.FC = () => {
  const { profile } = useAuthContext();
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterActive, setFilterActive] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  const fetchCourses = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('courses').select(`
        *,
        course_enrollments(count),
        lectures(
          assignments(count)
        )
      `);

      if (profile.role === 'teacher') {
        query = query.eq('created_by', profile.id);
      } else if (filterActive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        const coursesWithStats = data?.map(course => ({
          ...course,
          student_count: course.course_enrollments?.length || 0,
          assignment_count: course.lectures?.reduce((acc: number, lecture: any) => 
            acc + (lecture.assignments?.length || 0), 0) || 0
        })) || [];
        setCourses(coursesWithStats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollInCourse = async (courseId: string) => {
    if (!profile || profile.role !== 'student') return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert([{
          course_id: courseId,
          student_id: profile.id
        }]);

      if (error) {
        console.error('Error enrolling in course:', error);
      } else {
        fetchCourses(); // Refresh the list
      }
    } catch (error) {
      console.error('Error:', error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Курсове</h1>
          <p className="text-gray-600">
            {profile?.role === 'teacher' ? 'Управлявайте вашите курсове' : 'Разгледайте достъпните курсове'}
          </p>
        </div>
        {profile?.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Нов курс</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Търсене по име, код или описание..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterActive}
                onChange={(e) => setFilterActive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Само активни</span>
            </label>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">{course.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>

              {course.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.student_count} студенти</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{course.assignment_count} задания</span>
                </div>
              </div>

              {course.start_date && (
                <div className="text-xs text-gray-500 mb-4">
                  Започва: {new Date(course.start_date).toLocaleDateString('bg-BG')}
                </div>
              )}

              <div className="flex space-x-2">
                {profile?.role === 'student' && (
                  <button
                    onClick={() => handleEnrollInCourse(course.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Записване
                  </button>
                )}
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  Преглед
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Няма намерени курсове</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Опитайте с различни ключови думи' : 'Все още няма създадени курсове'}
          </p>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCourses();
          }}
        />
      )}
    </div>
  );
};