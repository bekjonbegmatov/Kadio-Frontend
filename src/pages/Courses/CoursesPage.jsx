import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiClock, FiUsers, FiStar, FiLock, FiPlay, FiEye, FiArrowRight, FiUser } from 'react-icons/fi';
import { coursesAPI } from '../../api/courses';
import './CoursesPage.css';

const CoursesPage = () => {
  const [stats, setStats] = useState({
    myCoursesCount: 0,
    availableCoursesCount: 0,
    comingSoonCount: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== COURSES PAGE: Loading course statistics ===');
      
      const [myCoursesResponse, allCoursesResponse] = await Promise.all([
        coursesAPI.getUserCourses(),
        coursesAPI.getCourses()
      ]);

      console.log('COURSES PAGE: API responses received');
      console.log('My courses response:', myCoursesResponse);
      console.log('All courses response:', allCoursesResponse);

      let myCoursesCount = 0;
      let availableCoursesCount = 0;
      let comingSoonCount = 0;
      let totalCourses = 0;

      // Подсчитываем мои курсы
      if (myCoursesResponse.success) {
        myCoursesCount = (myCoursesResponse.data || []).length;
      }
      
      // Подсчитываем все курсы и их категории
      if (allCoursesResponse.success) {
        const allCourses = allCoursesResponse.data || [];
        totalCourses = allCourses.length;
        
        availableCoursesCount = allCourses.filter(course => course.is_available !== false).length;
        comingSoonCount = allCourses.filter(course => course.is_available === false).length;
      }

      setStats({
        myCoursesCount,
        availableCoursesCount,
        comingSoonCount,
        totalCourses
      });

      console.log('COURSES PAGE: Stats calculated:', {
        myCoursesCount,
        availableCoursesCount,
        comingSoonCount,
        totalCourses
      });
    } catch (err) {
      setError('Ошибка при загрузке статистики курсов');
      console.error('Error loading course stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const CategoryCard = ({ title, description, count, icon: Icon, link, color }) => {
    return (
      <Link to={link} className="category-card">
        <div className="category-icon" style={{ backgroundColor: color }}>
          <Icon />
        </div>
        <div className="category-content">
          <h3 className="category-title">{title}</h3>
          <p className="category-description">{description}</p>
          <div className="category-count">{count} курсов</div>
        </div>
        <div className="category-arrow">
          <FiArrowRight />
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="courses-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка курсов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadCourses} className="btn btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    {
      title: "Мои курсы",
      description: "Курсы, на которые вы записаны",
      count: stats.myCourses || 0,
      icon: FiUser,
      link: "/courses/my",
      color: "#4F46E5"
    },
    {
      title: "Доступные курсы",
      description: "Курсы, доступные для изучения",
      count: stats.availableCourses || 0,
      icon: FiPlay,
      link: "/courses/available",
      color: "#059669"
    },
    {
      title: "Скоро доступные",
      description: "Курсы, которые скоро будут доступны",
      count: stats.comingSoonCourses || 0,
      icon: FiClock,
      link: "/courses/coming-soon",
      color: "#DC2626"
    },
    {
      title: "Все курсы",
      description: "Полный каталог всех курсов",
      count: stats.totalCourses || 0,
      icon: FiBook,
      link: "/courses/all",
      color: "#7C3AED"
    }
  ];

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Курсы</h1>
        <p>Выберите категорию курсов для изучения</p>
      </div>

      <div className="categories-grid">
        {categories.map((category, index) => (
          <CategoryCard 
            key={index}
            title={category.title}
            description={category.description}
            count={category.count}
            icon={category.icon}
            link={category.link}
            color={category.color}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;