import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Auth from '../pages/Auth';
import ProfilePage from '../pages/ProfilePage';

import { isAuthenticated } from '../api/auth';

// Pages
import FriendsPage from '../pages/Frends/FrendsPage';
import LeaderBoard from '../pages/LiderBoard/LeaderBoard';
import ChatsPage from '../pages/Chats/ChatsPage';
import CoursesPage from '../pages/Courses/CoursesPage';
import CoursesListPage from '../pages/Courses/CoursesListPage';
import CourseDetailPage from '../pages/Courses/CourseDetailPage';
import LessonPage from '../pages/Courses/LessonPage';

const AppRouter = () => {
  const userIsAuthenticated = isAuthenticated();

    useEffect(() => {
        console.log(userIsAuthenticated);
    }, [userIsAuthenticated]);

  return (
    <Router>
      {userIsAuthenticated ? (
        // Авторизованные пользователи
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />

            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/chats" element={<ChatsPage />} />
            
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/my" element={<CoursesListPage category="my-courses" />} />
            <Route path="/courses/available" element={<CoursesListPage category="available" />} />
            <Route path="/courses/all" element={<CoursesListPage category="all" />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />

          </Routes>
        </Layout>
      ) : (
        // Неавторизованные пользователи - перенаправление на авторизацию
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      )}
    </Router>
  );
};

export default AppRouter;