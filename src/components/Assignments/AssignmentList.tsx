import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Clock, CheckCircle, AlertCircle, Search, Upload } from 'lucide-react';
import { supabase, Assignment } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';

interface AssignmentWithDetails extends Assignment {
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

export const AssignmentList: React.FC = () => {
  const { profile } = useAuthContext();
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAssignments();
  }, [profile]);

  const fetchAssignments = async () => {
    if (!profile) return;

    console.log('Fetching assignments for profile:', profile.role, profile.id);

    try {
      let query = supabase
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
        `);

      if (profile.role === 'teacher') {
        console.log('Fetching as teacher - filtering by created_by');
        query = query.eq('created_by', profile.id);
      } else {
        console.log('Fetching as student - filtering by published status');
        query = query.eq('status', 'published');
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching assignments:', error);
      } else {
        console.log('Fetched assignments count:', data?.length || 0);
        console.log('Assignments data:', data);
        setAssignments(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = (assignment: AssignmentWithDetails) => {
    console.log('Opening submit modal for:', assignment.title);
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const getAssignmentStatus = (assignment: AssignmentWithDetails) => {
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.lecture.course.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = getAssignmentStatus(assignment).status;
    return matchesSearch && status === statusFilter;
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
          <h1 className="text-2xl font-bold text-gray-900">Задания</h1>
          <p className="text-gray-600">
            {profile?.role === 'teacher' ? 'Управлявайте заданията си' : 'Преглед и предаване на задания'}
          </p>
        </div>
        {profile?.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ново задание</span>
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
              placeholder="Търсене по заглавие, описание или курс..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Всички статуси</option>
            <option value="pending">Чакащи</option>
            <option value="submitted">Предадени</option>
            <option value="graded">Оценени</option>
            <option value="overdue">Просрочени</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);
          const StatusIcon = status.icon;
          const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
          
          return (
            <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">
                        {assignment.lecture.course.code} - {assignment.lecture.course.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Лекция: {assignment.lecture.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status === 'published' ? 'Публикувано' : 'Чернова'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {assignment.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Краен срок: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Точки: {assignment.max_points}</span>
                    </div>
                  </div>
                  {assignment.submissions?.[0]?.grade && (
                    <div className="font-medium text-green-600">
                      Оценка: {assignment.submissions[0].grade}/{assignment.max_points}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {profile?.role === 'student' && (
                    <>
                      {!hasSubmission ? (
                        <button
                          onClick={() => handleSubmitAssignment(assignment)}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2 font-medium"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Предай домашно</span>
                        </button>
                      ) : (
                        <div className="bg-green-50 text-green-700 py-2 px-4 rounded-lg text-sm flex items-center space-x-2 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          <span>Предадено</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {profile?.role === 'teacher' && (
                    <>
                      <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Преглед
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Редактирай
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Няма намерени задания</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Опитайте с различни ключови думи' : 'Все още няма създадени задания'}
          </p>
          {profile?.role === 'teacher' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Създай първото задание
            </button>
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAssignments();
          }}
        />
      )}

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