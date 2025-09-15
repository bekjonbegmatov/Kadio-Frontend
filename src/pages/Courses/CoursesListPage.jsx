import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiBook, FiClock, FiUsers, FiStar, FiLock, FiPlay, FiEye, FiArrowLeft } from 'react-icons/fi';
import { coursesAPI } from '../../api/courses';
import './CoursesPage.css';

const CoursesListPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Определяем заголовок и описание на основе категории
  const getCategoryInfo = () => {
    switch (category) {
      case 'available':
        return {
          title: 'Доступные курсы',
          description: 'Курсы, которые вы можете изучать прямо сейчас'
        };
      case 'coming-soon':
        return {
          title: 'Скоро доступные',
          description: 'Курсы, которые скоро будут доступны для изучения'
        };
      case 'my-courses':
        return {
          title: 'Мои курсы',
          description: 'Курсы, на которые вы записаны'
        };
      default:
        return {
          title: 'Все курсы',
          description: 'Полный каталог доступных курсов'
        };
    }
  };

  useEffect(() => {
    loadCourses();
  }, [category]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== COURSES LIST: Loading courses for category:', category);
      
      let response;
      
      switch (category) {
        case 'my-courses':
          response = await coursesAPI.getUserCourses();
          break;
        case 'available':
          response = await coursesAPI.getCourses();
          if (response.success) {
            // Фильтруем только доступные курсы
            response.data = response.data.filter(course => course.is_available !== false);
          }
          break;
        case 'coming-soon':
          response = await coursesAPI.getCourses();
          if (response.success) {
            // Фильтруем только недоступные курсы
            response.data = response.data.filter(course => course.is_available === false);
          }
          break;
        default:
          response = await coursesAPI.getCourses();
          break;
      }

      console.log('COURSES LIST: API response:', response);

      if (response.success) {
        setCourses(response.data || []);
        console.log('COURSES LIST: Courses set:', response.data);
      } else {
        setError(response.error || 'Ошибка при загрузке курсов');
      }
    } catch (err) {
      setError('Ошибка при загрузке курсов');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const CourseCard = ({ course, isMyCourse = false, isUnavailable = false }) => {
    const progressPercentage = isMyCourse ? (course.progress?.percentage || 0) : 0;
    
    return (
      <div className={`course-card ${isUnavailable ? 'unavailable' : ''}`}>
        <div className="course-image">
          {course.preview ? (
            <img 
              src={course.preview} 
              alt={course.name || course.title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="course-image-placeholder" style={{display: course.preview ? 'none' : 'flex'}}>
            <FiBook className="placeholder-icon" />
            <span>Изображение курса</span>
          </div>
          {isUnavailable && (
            <div className="course-overlay">
              <FiLock className="lock-icon" />
            </div>
          )}
          {isMyCourse && (
            <div className="progress-overlay">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round(progressPercentage)}%</span>
            </div>
          )}
        </div>
        
        <div className="course-content">
          <h3 className="course-title">{course.name || course.title}</h3>
          <p className="course-description">{course.description || course.short_description}</p>
          
          <div className="course-meta">
            <div className="meta-item">
              <FiClock className="meta-icon" />
              <span>{course.lessons_count || 0} уроков</span>
            </div>
            <div className="meta-item">
              <FiUsers className="meta-icon" />
              <span>{course.students_count || 0} студентов</span>
            </div>
            <div className="meta-item">
              <FiStar className="meta-icon" />
              <span>{course.average_rating || 0}</span>
            </div>
          </div>
          
          <div className="course-footer">
            <div className="course-price">
              {course.price ? `${course.price} баллов` : 'Бесплатно'}
            </div>
            <Link 
              to={`/courses/${course.id}`} 
              className={`btn ${isUnavailable ? 'btn-disabled' : 'btn-primary'}`}
            >
              {isUnavailable ? (
                <>
                  <FiLock className="btn-icon" />
                  Скоро
                </>
              ) : isMyCourse ? (
                <>
                  <FiPlay className="btn-icon" />
                  Продолжить
                </>
              ) : (
                <>
                  <FiEye className="btn-icon" />
                  Подробнее
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const categoryInfo = getCategoryInfo();
  const isMyCourses = category === 'my-courses';
  const isComingSoon = category === 'coming-soon';

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

  return (
    <div className="courses-page">
      <div className="courses-header">
        <button onClick={() => navigate('/courses')} className="back-btn">
          <FiArrowLeft /> Назад к курсам
        </button>
        <h1>{categoryInfo.title}</h1>
        <p>{categoryInfo.description}</p>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadCourses} className="btn btn-primary">
            Попробовать снова
          </button>
        </div>
      )}

      <div className="courses-content">
        {courses.length === 0 && !loading && !error ? (
          <div className="empty-state">
            <FiBook className="empty-icon" />
            <h3>Курсы не найдены</h3>
            <p>В данной категории пока нет курсов</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isMyCourse={isMyCourses}
                isUnavailable={isComingSoon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesListPage;