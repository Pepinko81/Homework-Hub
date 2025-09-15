import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { TeacherDashboard } from './components/Dashboard/TeacherDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { CourseList } from './components/Courses/CourseList';
import { AssignmentList } from './components/Assignments/AssignmentList';
import { SubmissionList } from './components/Submissions/SubmissionList';

const AuthWrapper: React.FC = () => {
  const { user, profile, loading } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  // Show fallback after 10 seconds if still loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      timer = setTimeout(() => {
        if (loading) {
          setShowFallback(true);
        }
      }, 5000); // Reduced to 5 seconds
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Vibe-Coding Homework</h2>
            <p className="text-sm text-gray-500">От идеята до оценката – един поток, една платформа</p>
            {showFallback && (
              <div className="mt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-red-800 mb-3">
                    Проблем с връзката към базата данни. Възможни причини:
                  </p>
                  <ul className="text-xs text-red-700 mb-3 list-disc list-inside">
                    <li>Supabase сървърът не отговаря</li>
                    <li>Проблем с автентикацията</li>
                    <li>Мрежова грешка</li>
                  </ul>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Презареди
                    </button>
                    <button
                      onClick={() => {
                        setLoading(false);
                        setShowFallback(false);
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Принудително влизане
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return isLogin ? (
      <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
    );
  }

  return <MainApp />;
};

const MainApp: React.FC = () => {
  const { profile } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (profile?.role === 'student') {
          return <StudentDashboard />;
        } else if (profile?.role === 'teacher') {
          return <TeacherDashboard />;
        } else if (profile?.role === 'admin') {
          return <AdminDashboard />;
        }
        return <div>Неразпознат потребител</div>;
      
      case 'courses':
        return <CourseList />;
      
      case 'assignments':
        return <AssignmentList />;
      
      case 'submissions':
        return <SubmissionList />;
      
      case 'students':
      case 'users':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {profile?.role === 'admin' ? 'Потребители' : 'Студенти'}
            </h2>
            <p className="text-gray-500">Тази функционалност ще бъде добавена скоро...</p>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Анализи</h2>
            <p className="text-gray-500">Тази функционалност ще бъде добавена скоро...</p>
          </div>
        );
      
      case 'settings':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Настройки</h2>
            <p className="text-gray-500">Тази функционалност ще бъде добавена скоро...</p>
          </div>
        );
      
      default:
        return <div>Страницата не е намерена</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;