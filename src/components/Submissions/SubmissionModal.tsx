import React, { useState } from 'react';
import { X, Star, FileText, Download, Calendar, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface SubmissionModalProps {
  submission: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ submission, onClose, onUpdate }) => {
  const { profile } = useAuthContext();
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGradeSubmission = async () => {
    if (!profile || profile.role !== 'teacher') return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade: parseInt(grade),
          feedback: feedback || null,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: profile.id,
        })
        .eq('id', submission.id);

      if (error) {
        setError(error.message);
      } else {
        onUpdate();
        onClose();
      }
    } catch (err) {
      setError('Възникна грешка при оценяването');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGradeColor = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {submission.assignment.title}
              </h2>
              <p className="text-sm text-gray-500">
                {submission.assignment.lecture.course.code} - {submission.assignment.lecture.course.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submission Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Предадено: {formatDate(submission.submitted_at)}</span>
              </div>
              
              {profile?.role === 'teacher' && submission.student && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Студент: {submission.student.full_name}</span>
                </div>
              )}

              {submission.file_name && (
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{submission.file_name}</span>
                  {submission.file_url && (
                    <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>Изтегли</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {submission.grade !== null && (
                <div className="text-right">
                  <span className="text-sm text-gray-600">Оценка: </span>
                  <span className={`text-lg font-semibold ${getGradeColor(submission.grade, submission.assignment.max_points)}`}>
                    {submission.grade}/{submission.assignment.max_points}
                  </span>
                </div>
              )}

              {submission.graded_at && (
                <div className="text-right text-sm text-gray-600">
                  Оценено: {formatDate(submission.graded_at)}
                </div>
              )}
            </div>
          </div>

          {/* Prompt Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Промпт текст</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {submission.prompt_text}
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          {submission.prompt_analysis && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Анализ</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 whitespace-pre-wrap">
                  {submission.prompt_analysis}
                </p>
              </div>
            </div>
          )}

          {/* Existing Feedback */}
          {submission.feedback && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Обратна връзка</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-800 whitespace-pre-wrap">
                  {submission.feedback}
                </p>
              </div>
            </div>
          )}

          {/* Grading Section (for teachers) */}
          {profile?.role === 'teacher' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {submission.grade !== null ? 'Редактирай оценка' : 'Оцени предаването'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Оценка (от {submission.assignment.max_points} точки)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={submission.assignment.max_points}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Обратна връзка
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Напишете обратна връзка за студента..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleGradeSubmission}
                    disabled={loading || !grade}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>{loading ? 'Записване...' : 'Запиши оценка'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};