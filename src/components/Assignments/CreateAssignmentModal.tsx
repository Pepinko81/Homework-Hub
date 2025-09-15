import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface CreateAssignmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Lecture {
  id: string;
  title: string;
  lecture_number: number;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ onClose, onSuccess }) => {
  const { profile } = useAuthContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    max_points: 100,
    course_id: '',
    lecture_id: '',
    allow_late_submission: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  useEffect(() => {
    if (formData.course_id) {
      fetchLectures(formData.course_id);
    } else {
      setLectures([]);
      setFormData(prev => ({ ...prev, lecture_id: '' }));
    }
  }, [formData.course_id]);

  const fetchCourses = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('created_by', profile.id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLectures = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lectures')
        .select('id, title, lecture_number')
        .eq('course_id', courseId)
        .order('lecture_number');

      if (error) {
        console.error('Error fetching lectures:', error);
      } else {
        setLectures(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('assignments')
        .insert([{
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions || null,
          due_date: formData.due_date,
          max_points: formData.max_points,
          lecture_id: formData.lecture_id,
          allow_late_submission: formData.allow_late_submission,
          created_by: profile.id,
          status: 'published',
        }]);

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Възникна грешка при създаването на заданието');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Ново задание</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Курс *
              </label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Изберете курс</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Лекция *
              </label>
              <select
                required
                value={formData.lecture_id}
                onChange={(e) => setFormData({ ...formData, lecture_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.course_id}
              >
                <option value="">Изберете лекция</option>
                {lectures.map(lecture => (
                  <option key={lecture.id} value={lecture.id}>
                    Лекция {lecture.lecture_number}: {lecture.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заглавие *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Въведете заглавие на заданието"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Кратко описание на заданието..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Инструкции
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Подробни инструкции за изпълнение..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Краен срок *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Максимални точки
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.max_points}
                onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allow_late"
              checked={formData.allow_late_submission}
              onChange={(e) => setFormData({ ...formData, allow_late_submission: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allow_late" className="text-sm text-gray-700">
              Разреши предаване след крайния срок
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Създаване...' : 'Създай задание'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};