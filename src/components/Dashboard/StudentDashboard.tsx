import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, BookOpen, Upload, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { SubmitAssignmentModal } from '../Assignments/SubmitAssignmentModal';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  status: string;
  lecture: {
    title: string;
    course: {
      name: string;
      code: string;
    };
  };
  submissions?: {
    id: string;
    status: string;
    grade: number | null;
    submitted_at: string;
  }[];
}

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuthContext();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [profile]);

  const fetchAssignments = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          lecture:lectures (
            title,
            course:courses (
              name,
              code
            )
          ),
          submissions (
            id,
            status,
            grade,
            submitted_at
          )
        `)
        .eq('status', 'published')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching assignments:', error);
      } else {
        setAssignments(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = assignment.submissions?.[0];
    const dueDate = new Date(assignment.due_date);
    const now = new Date();

    if (submission) {
      if (submission.grade !== null) {
        return { status: 'graded', label: 'Оценено', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
      }
      return { status: 'submitted', label: 'Предадено', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle };
    }

    if (now > dueDate) {
      return { status: 'overdue', label: 'Просрочено', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
    }

    return { status: 'pending', label: 'Чакащо', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleQuickSubmit = (assignment: Assignment) => {
    console.log('Quick submit for:', assignment.title);
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const upcomingAssignments = assignments.filter(a => {
    const submission = a.submissions?.[0];
    const dueDate = new Date(a.due_date);
    const now = new Date();
    return !submission && now <= dueDate;
  }).slice(0, 5);

  const recentSubmissions = assignments.filter(a => a.submissions?.[0]).slice(0, 5);

  const totalAssignments = assignments.length;
  const submittedCount = assignments.filter(a => a.submissions?.[0]).length;
  const gradedCount = assignments.filter(a => typeof a.submissions?.[0]?.grade === 'number').length;
  const averageGrade = gradedCount > 0 
    ? Math.round(
        assignments
          .filter(a => typeof a.submissions?.[0]?.grade === 'number')
          .reduce((sum, a) => sum + (a.submissions![0].grade || 0), 0) / gradedCount
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Добре дошли, {profile?.full_name}! 👋
        </h1>
        <p className="text-blue-100">
          Управлявайте вашите домашни задания и следете прогреса си
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Общо задания</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Предстоящи</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Предадени</p>
              <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Средна оценка</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageGrade > 0 ? averageGrade : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Предстоящи задания</h2>
            <p className="text-sm text-gray-500">Задания които трябва да предадете</p>
          </div>
          <div className="p-6">
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">Няма предстоящи задания</p>
                <p className="text-sm text-gray-400">Всички задания са предадени!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded ${status.bg}`}>
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {assignment.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {assignment.lecture.course.code} - {assignment.lecture.title}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(assignment.due_date)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {assignment.max_points} т.
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickSubmit(assignment)}
                        className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2 font-medium"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Предай домашно</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Скорошни предавания</h2>
            <p className="text-sm text-gray-500">Вашите последни предадени задания</p>
          </div>
          <div className="p-6">
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Няма предадени задания</p>
                <p className="text-sm text-gray-400">Предайте първото си задание!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((assignment) => {
                  const submission = assignment.submissions![0];
                  
                  return (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded ${submission.grade ? 'bg-green-50' : 'bg-blue-50'}`}>
                          <CheckCircle className={`h-4 w-4 ${submission.grade ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {assignment.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {assignment.lecture.course.code} - {assignment.lecture.title}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-500">
                              Предадено: {formatDate(submission.submitted_at)}
                            </div>
                            {submission.grade !== null ? (
                              <div className="text-sm font-medium text-green-600">
                                {submission.grade}/{assignment.max_points} т.
                              </div>
                            ) : (
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Чака оценяване
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <SubmitAssignmentModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
          }}
          onSuccess={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
};