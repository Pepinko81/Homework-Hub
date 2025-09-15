import React, { useState } from 'react';
import { X, Upload, Link, FileText, AlertCircle, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface SubmitAssignmentModalProps {
  assignment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({ 
  assignment, 
  onClose, 
  onSuccess 
}) => {
  const { profile } = useAuthContext();
  const [promptText, setPromptText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !promptText.trim()) {
      setError('Моля въведете промпт текста');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if submission already exists
      const { data: existingSubmission } = await supabase
        .from('submissions')
        .select('id')
        .eq('assignment_id', assignment.id)
        .eq('student_id', profile.id)
        .maybeSingle();

      if (existingSubmission) {
        setError('Вече сте предали това задание');
        setLoading(false);
        return;
      }

      // Create new submission
      const { error: submitError } = await supabase
        .from('submissions')
        .insert([{
          assignment_id: assignment.id,
          student_id: profile.id,
          prompt_text: promptText.trim(),
          file_url: fileUrl.trim() || null,
          file_name: fileName.trim() || null,
          max_points: assignment.max_points,
          status: 'submitted'
        }]);

      if (submitError) {
        console.error('Submit error:', submitError);
        setError('Грешка при предаването: ' + submitError.message);
      } else {
        alert('Заданието е предадено успешно!');
        onSuccess();
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Възникна грешка при предаването');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = new Date() > new Date(assignment.due_date);
  const canSubmit = !isOverdue || assignment.allow_late_submission;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Предай домашно
              </h2>
              <p className="text-sm text-gray-500">
                {assignment.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Assignment Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">{assignment.title}</h3>
                <p className="text-blue-800 text-sm mb-3">{assignment.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-blue-700">
                    <Calendar className="h-4 w-4" />
                    <span>Краен срок: {formatDate(assignment.due_date)}</span>
                  </div>
                  <span className="text-blue-700 font-medium">
                    Точки: {assignment.max_points}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Warnings */}
          {isOverdue && !assignment.allow_late_submission && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">
                  Крайният срок за това задание е изтекъл и не се разрешава късно предаване
                </p>
              </div>
            </div>
          )}

          {isOverdue && assignment.allow_late_submission && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <p className="text-orange-800 font-medium">
                  Крайният срок е изтекъл, но се разрешава късно предаване
                </p>
              </div>
            </div>
          )}

          {canSubmit && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {assignment.instructions && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Инструкции за изпълнение:</span>
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {assignment.instructions}
                  </p>
                </div>
              )}

              {/* Prompt Text - REQUIRED */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  🤖 Опишете вашия AI промпт *
                </label>
                <textarea
                  required
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Опишете подробно какъв промпт сте дали на AI инструмента за създаване на домашното...

Пример:
'Създай уеб страница за ресторант с HTML, CSS и JavaScript. Страницата трябва да има навигация, секция за меню с цени, контакти и форма за резервация. Използвай модерен дизайн с тъмни цветове.'"
                />
                <p className="text-xs text-blue-600 mt-2 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Това поле е задължително - опишете точно какъв промпт сте използвали</span>
                </p>
              </div>

              {/* File URL - OPTIONAL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  🔗 Линк към готовото домашно (опционално)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://github.com/username/project или https://drive.google.com/..."
                  />
                  <Link className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Добавете линк към GitHub репо, Google Drive, CodePen, или друга платформа където е качено домашното
                </p>
              </div>

              {/* File Name - OPTIONAL */}
              {fileUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    📁 Име на проекта/файла
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Моето домашно.html, Ресторант проект, и т.н."
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  disabled={loading || !promptText.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>{loading ? 'Предаване...' : 'Предай домашно'}</span>
                </button>
              </div>
            </form>
          )}

          {!canSubmit && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Не можете да предадете това задание
              </h3>
              <p className="text-gray-500">
                Крайният срок е изтекъл и не се разрешава късно предаване
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};