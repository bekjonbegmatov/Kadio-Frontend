import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiLock, FiClock, FiUsers, FiStar, FiMessageCircle, FiBookOpen, FiCheckCircle } from 'react-icons/fi';
import { coursesAPI } from '../../api/courses';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== COURSE DETAIL: Loading course data for ID:', courseId);
      
      const [courseResponse, lessonsResponse, commentsResponse] = await Promise.all([
        coursesAPI.getCourseById(courseId),
        coursesAPI.getCourseLessons(courseId),
        coursesAPI.getCourseComments(courseId)
      ]);

      console.log('COURSE DETAIL: API responses received');
      console.log('Course response:', courseResponse);
      console.log('Lessons response:', lessonsResponse);
      console.log('Comments response:', commentsResponse);

      if (courseResponse.success && courseResponse.data) {
        setCourse(courseResponse.data);
        setIsEnrolled(courseResponse.data.is_purchased || false);
        console.log('COURSE DETAIL: Course data set:', courseResponse.data);
      } else {
        throw new Error(courseResponse.error || 'Failed to load course');
      }
      
      if (lessonsResponse.success) {
        setLessons(lessonsResponse.data || []);
        console.log('COURSE DETAIL: Lessons set:', lessonsResponse.data);
      } else {
        console.error('Failed to load lessons:', lessonsResponse.error);
        setLessons([]);
      }
      
      if (commentsResponse.success) {
        setComments(commentsResponse.data || []);
        console.log('COURSE DETAIL: Comments set:', commentsResponse.data);
      } else {
        console.error('Failed to load comments:', commentsResponse.error);
        setComments([]);
      }
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке курса');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async () => {
    try {
      await coursesAPI.purchaseCourse(courseId);
      setIsEnrolled(true);
      // Перезагружаем данные курса
      loadCourseData();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Ошибка при записи на курс');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await coursesAPI.createCourseComment(courseId, newComment);
      if (response.success) {
        setNewComment('');
        // Перезагружаем комментарии
        const commentsResponse = await coursesAPI.getCourseComments(courseId);
        if (commentsResponse.success) {
          setComments(commentsResponse.data || []);
        }
      } else {
        alert(response.error || 'Ошибка при добавлении комментария');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Ошибка при добавлении комментария');
    }
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-page">
        <div className="error-container">
          <p className="error-message">{error || 'Курс не найден'}</p>
          <button onClick={() => navigate('/courses')} className="btn btn-primary">
            Вернуться к курсам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <button onClick={() => navigate('/courses')} className="back-btn">
          <FiArrowLeft /> Назад к курсам
        </button>
        
        <div className="course-hero">
          <div className="course-image">
            {course.preview ? (
              <img 
                src={course.preview} 
                alt={course.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="course-image-placeholder" style={{display: course.preview ? 'none' : 'flex'}}>
              <FiBookOpen className="placeholder-icon" />
              <span>Изображение курса</span>
            </div>
          </div>
          
          <div className="course-info">
            <h1 className="course-title">{course.title}</h1>
            <p className="course-short-description">{course.short_description}</p>
            
            <div className="course-meta">
              <div className="meta-item">
                <FiClock className="meta-icon" />
                <span>{course.duration || 'Не указано'}</span>
              </div>
              <div className="meta-item">
                <FiUsers className="meta-icon" />
                <span>{course.students_count || 0} студентов</span>
              </div>
              <div className="meta-item">
                <FiStar className="meta-icon" />
                <span>{course.rating || 'Нет оценок'}</span>
              </div>
              <div className="meta-item">
                <FiBookOpen className="meta-icon" />
                <span>{lessons.length} уроков</span>
              </div>
            </div>
            
            <div className="course-actions">
              {isEnrolled ? (
                <Link to={`/courses/${courseId}/lessons/${lessons[0]?.id}`} className="btn btn-primary btn-large">
                  <FiPlay className="btn-icon" /> Начать обучение
                </Link>
              ) : course.is_available ? (
                <>
                  <button onClick={handleEnrollCourse} className="btn btn-primary btn-large">
                    Записаться на курс
                  </button>
                  {course.price && (
                    <div className="course-price">
                      <span className="price">{course.price} ₽</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="unavailable-notice">
                  <FiLock className="lock-icon" />
                  <span>Курс пока недоступен</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="course-content">
        <div className="content-tabs">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Описание
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            Уроки ({lessons.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Комментарии ({comments.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <div className="markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {course.description || 'Описание не указано'}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="lessons-content">
              <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className={`lesson-item ${!isEnrolled ? 'locked' : ''}`}>
                    <div className="lesson-number">{index + 1}</div>
                    <div className="lesson-info">
                      <h3 className="lesson-title">{lesson.title}</h3>
                      <p className="lesson-description">{lesson.short_description}</p>
                      <div className="lesson-meta">
                        <span className="lesson-duration">
                          <FiClock className="meta-icon" />
                          {lesson.duration || 'Не указано'}
                        </span>
                      </div>
                    </div>
                    <div className="lesson-actions">
                      {isEnrolled ? (
                        <Link 
                          to={`/courses/${courseId}/lessons/${lesson.id}`} 
                          className="btn btn-outline"
                        >
                          <FiPlay className="btn-icon" /> Изучить
                        </Link>
                      ) : (
                        <div className="locked-lesson">
                          <FiLock className="lock-icon" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-content">
              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Оставьте свой комментарий о курсе..."
                  className="comment-input"
                  rows={4}
                />
                <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                  <FiMessageCircle className="btn-icon" /> Добавить комментарий
                </button>
              </form>

              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">
                        <img 
                          src={comment.user?.avatar || '/api/placeholder/40/40'} 
                          alt={comment.user?.username}
                          onError={(e) => {
                            e.target.src = '/api/placeholder/40/40';
                          }}
                        />
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user?.username || 'Пользователь'}</span>
                          <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-comments">
                    <FiMessageCircle className="empty-icon" />
                    <p>Пока нет комментариев. Будьте первым!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;