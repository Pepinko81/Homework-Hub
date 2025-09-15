import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, Submission } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { SubmissionModal } from './SubmissionModal';

interface SubmissionWithDetails extends Submission {
  assignment: {
    title: string;
    max_points: number;
    due_date: string;
    lecture: {
      title: string;
      course: {
        name: string;
        code: string;
      };
    };
  };
  student?: {
    full_name: string;
    email: string;
  };
}

export const SubmissionList: React.FC = () => {
  const { profile } = useAuthContext();
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, [profile]);

  const fetchSubmissions = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          assignment:assignments (
            title,
            max_points,
            due_date,
            lecture:lectures (
              title,
              course:courses (
                name,
                code
              )
            )
          ),
          student:profiles!submissions_student_id_fkey (
            full_name,
            email
          )
        `);

      if (profile.role === 'student') {
        query = query.eq('student_id', profile.id);
      } else if (profile.role === 'teacher') {
        // Get submissions for assignments created by this teacher
        query = query.eq('assignment.lecture.course.created_by', profile.id);
      }

      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
      } else {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (submission: SubmissionWithDetails) => {
    if (submission.grade !== null) {
      return { 
        status: 'graded', 
        label: 'Оценено', 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        icon: CheckCircle 
      };
    }
    
    if (submission.status === 'returned') {
      return { 
        status: 'returned', 
        label: 'Върнато', 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        icon: AlertCircle 
      };
    }
    
    return { 
      status: 'submitted', 
      label: 'Предадено', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      icon: Clock 
    };
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (statusFilter === 'all') return true;
    const status = getSubmissionStatus(submission).status;
    return status === statusFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
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
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.role === 'student' ? 'Моите предавания' : 'Оценяване'}
          </h1>
          <p className="text-gray-600">
            {profile?.role === 'student' 
              ? 'Преглед на предадените задания и оценки' 
              : 'Оценяване на предадени задания от студенти'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Филтър по статус:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Всички</option>
            <option value="submitted">Предадени</option>
            <option value="graded">Оценени</option>
            <option value="returned">Върнати</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => {
          const status = getSubmissionStatus(submission);
          const StatusIcon = status.icon;
          
          return (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {submission.assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {submission.assignment.lecture.course.code} - {submission.assignment.lecture.course.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Лекция: {submission.assignment.lecture.title}
                      </p>
                      {profile?.role === 'teacher' && submission.student && (
                        <p className="text-sm text-gray-500">
                          Студент: {submission.student.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    {submission.grade !== null && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${getGradeColor(submission.grade, submission.assignment.max_points)}`}>
                        {submission.grade}/{submission.assignment.max_points}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Промпт текст:</h4>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {submission.prompt_text}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>Предадено: {formatDate(submission.submitted_at)}</span>
                    {submission.file_name && (
                      <span>Файл: {submission.file_name}</span>
                    )}
                  </div>
                  {submission.graded_at && (
                    <span>Оценено: {formatDate(submission.graded_at)}</span>
                  )}
                </div>

                {submission.feedback && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Обратна връзка:</h4>
                    <p className="text-blue-800 text-sm">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Преглед</span>
                  </button>
                  
                  {submission.file_url && (
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>Изтегли</span>
                    </button>
                  )}
                  
                  {profile?.role === 'teacher' && submission.grade === null && (
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                    >
                      <Star className="h-4 w-4" />
                      <span>Оцени</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Няма намерени предавания</h3>
          <p className="text-gray-500">
            {profile?.role === 'student' 
              ? 'Все още не сте предали задания' 
              : 'Няма предадени задания за оценяване'
            }
          </p>
        </div>
      )}

      {/* Submission Modal */}
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={fetchSubmissions}
        />
      )}
    </div>
  );
};