import React, { useState, useEffect } from 'react';
import './CommentList.css';
import { getComments, createComment, deleteComment, likeComment } from '../../api/feed';

const CommentList = ({ postId, commentsCount: initialCount = 0 }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Загрузка комментариев
  const loadComments = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getComments(postId, pageNum);
      const newComments = response.results || [];
      
      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }
      
      setHasMore(!!response.next);
      setCommentsCount(response.count || newComments.length);
      
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
      setError('Не удалось загрузить комментарии');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Загрузка еще комментариев
  const loadMoreComments = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadComments(nextPage, true);
    }
  };

  // Создание нового комментария
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const comment = await createComment(postId, {
        content: newComment.trim()
      });
      
      // Добавляем новый комментарий в начало списка
      setComments(prev => [comment, ...prev]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
      
    } catch (err) {
      console.error('Ошибка создания комментария:', err);
      setError(err.response?.data?.message || 'Не удалось добавить комментарий');
    } finally {
      setSubmitting(false);
    }
  };

  // Удаление комментария
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }
    
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
      setError('Не удалось удалить комментарий');
    }
  };

  // Лайк комментария
  const handleLikeComment = async (commentId) => {
    try {
      const response = await likeComment(commentId);
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: response.is_liked,
            likes_count: response.likes_count
          };
        }
        return comment;
      }));
      
    } catch (err) {
      console.error('Ошибка лайка комментария:', err);
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Получение URL аватара
  const getAvatarUrl = (user) => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL}${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=4f46e5&color=fff&size=40`;
  };

  // Загрузка комментариев при монтировании
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="comments-loading">
        <div className="loading-spinner large"></div>
        <p>Загрузка комментариев...</p>
      </div>
    );
  }

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h3>Комментарии ({commentsCount})</h3>
      </div>
      
      {error && (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}
      
      {/* Форма добавления комментария */}
      <form className="comment-form" onSubmit={handleSubmitComment}>
        <div className="comment-input-container">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            className="comment-input"
            rows={3}
            maxLength={1000}
            disabled={submitting}
          />
          <div className="comment-form-footer">
            <div className="char-count">
              {newComment.length}/1000
            </div>
            <button
              type="submit"
              className="submit-comment-btn"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <>
                  <div className="loading-spinner small"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Отправить
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Список комментариев */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <svg className="no-comments-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Пока нет комментариев</p>
            <span>Станьте первым, кто оставит комментарий!</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                <img
                  src={getAvatarUrl(comment.author)}
                  alt={comment.author?.username || 'User'}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.username || 'User')}&background=4f46e5&color=fff&size=40`;
                  }}
                />
              </div>
              
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.author?.first_name && comment.author?.last_name
                      ? `${comment.author.first_name} ${comment.author.last_name}`
                      : comment.author?.username || 'Пользователь'
                    }
                  </span>
                  <span className="comment-date">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                
                <div className="comment-text">
                  {comment.content}
                </div>
                
                <div className="comment-actions">
                  <button
                    className={`comment-like-btn ${comment.is_liked ? 'liked' : ''}`}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <svg className="like-icon" viewBox="0 0 24 24" fill={comment.is_liked ? 'currentColor' : 'none'} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {comment.likes_count > 0 && (
                      <span>{comment.likes_count}</span>
                    )}
                  </button>
                  
                  {/* Кнопка удаления для автора комментария */}
                  {comment.can_delete && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Удалить комментарий"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Кнопка загрузки еще комментариев */}
        {hasMore && comments.length > 0 && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={loadMoreComments}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <div className="loading-spinner small"></div>
                  Загрузка...
                </>
              ) : (
                'Показать еще комментарии'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;