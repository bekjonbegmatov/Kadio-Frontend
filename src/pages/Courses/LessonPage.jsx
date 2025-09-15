import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiUser, FiStar, FiLock, FiMessageCircle, FiSend, FiPlay } from 'react-icons/fi';
import UserAvatar from '../../components/DefaultAvatar/UserAvatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { coursesAPI } from '../../api/courses';
import './LessonPage.css';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadLessonData();
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем данные урока и курса параллельно
      const [lessonResponse, courseResponse] = await Promise.all([
        coursesAPI.getLessonById(courseId, lessonId),
        coursesAPI.getCourseById(courseId)
      ]);
      
      setLesson(lessonResponse.data);
      setCourse(courseResponse.data);
      setHasAccess(lessonResponse.data.hasAccess || false);
      
      // Загружаем комментарии только если есть доступ
      if (lessonResponse.data.hasAccess) {
        const commentsResponse = await coursesAPI.getLessonComments(courseId, lessonId);
        setComments(commentsResponse.data || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки урока:', err);
      setError('Не удалось загрузить урок. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !hasAccess) return;

    try {
      setSubmittingComment(true);
      const response = await coursesAPI.addLessonComment(courseId, lessonId, {
        content: newComment.trim()
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Ошибка добавления комментария:', err);
      alert('Не удалось добавить комментарий. Попробуйте позже.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка урока...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={loadLessonData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="lesson-page">
        <div className="error-container">
          <p className="error-message">Урок не найден</p>
          <button className="btn btn-primary" onClick={handleGoBack}>
            Вернуться к курсу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <button className="back-btn" onClick={handleGoBack}>
        <FiArrowLeft className="btn-icon" />
        Вернуться к курсу
      </button>

      <div className="lesson-header">
        <div className="lesson-breadcrumb">
          <span className="course-name">{course.title}</span>
          <span className="separator">•</span>
          <span className="lesson-name">Урок {lesson.order}</span>
        </div>
        
        <h1 className="lesson-title">{lesson.title}</h1>
        
        <div className="lesson-meta">
          <div className="meta-item">
            <FiClock className="meta-icon" />
            <span>{lesson.duration || '15 мин'}</span>
          </div>
          <div className="meta-item">
            <FiUser className="meta-icon" />
            <span>{lesson.instructor || course.instructor}</span>
          </div>
          {lesson.difficulty && (
            <div className="meta-item">
              <span className={`difficulty-badge ${lesson.difficulty}`}>
                {lesson.difficulty === 'beginner' && 'Начальный'}
                {lesson.difficulty === 'intermediate' && 'Средний'}
                {lesson.difficulty === 'advanced' && 'Продвинутый'}
              </span>
            </div>
          )}
        </div>
      </div>

      {!hasAccess ? (
        <div className="access-denied">
          <div className="access-denied-content">
            <FiLock className="lock-icon" />
            <h2>Доступ ограничен</h2>
            <p>Для просмотра содержимого урока необходимо приобрести курс</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              Перейти к курсу
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="lesson-content">
            <div className="lesson-body">
              <div className="lesson-video">
                {lesson.video ? (
                  <video 
                    controls 
                    poster={lesson.thumbnail}
                    className="video-player"
                  >
                    <source src={lesson.video} type="video/mp4" />
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                ) : (
                  <div className="video-placeholder">
                    <FiPlay className="video-placeholder-icon" />
                    <h3>Видео урока</h3>
                    <p>Видео для этого урока будет добавлено позже</p>
                  </div>
                )}
              </div>
              
              <div className="lesson-description">
                <ReactMarkdown 
                  className="markdown-content"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {lesson.description || 'Содержимое урока будет добавлено позже.'}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="lesson-comments">
            <div className="comments-header">
              <h3>
                <FiMessageCircle className="comments-icon" />
                Комментарии ({comments.length})
              </h3>
            </div>

            <form className="comment-form" onSubmit={handleSubmitComment}>
              <textarea
                className="comment-input"
                placeholder="Поделитесь своими мыслями об уроке..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                disabled={submittingComment}
              />
              <div className="comment-form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? 'Отправка...' : 'Добавить комментарий'}
                </button>
              </div>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="empty-comments">
                  <FiMessageCircle className="empty-icon" />
                  <p>Пока нет комментариев к этому уроку</p>
                  <p>Будьте первым, кто поделится мнением!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      <UserAvatar 
                        user={comment.user}
                        size={48}
                      />
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">
                          {comment.user?.username || 'Аноним'}
                        </span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LessonPage;