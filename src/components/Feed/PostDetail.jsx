import React, { useState, useEffect } from 'react';
import './PostDetail.css';
import { API_BASE_URL } from '../../api/config';
import { getPost, toggleLike, getComments, createComment } from '../../api/feed';
import UserAvatar from '../DefaultAvatar/UserAvatar';
import CommentsList from './CommentsList';

const PostDetail = ({ postId, onClose, initialPost = null }) => {
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      setIsLiked(initialPost.is_liked);
      setLikesCount(initialPost.likes_count);
      setLoading(false);
    } else if (postId) {
      loadPost();
    }
    
    if (postId) {
      loadComments();
    }
  }, [postId, initialPost]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const postData = await getPost(postId);
      setPost(postData);
      setIsLiked(postData.is_liked);
      setLikesCount(postData.likes_count);
    } catch (err) {
      console.error('Ошибка загрузки поста:', err);
      setError(err.message || 'Ошибка загрузки поста');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const commentsData = await getComments(postId);
      setComments(commentsData.results || []);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking || !post) return;
    
    setIsLiking(true);
    try {
      await toggleLike(post.id);
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment || !post) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        content: newComment.trim()
      };
      
      const createdComment = await createComment(post.id, commentData);
      setComments(prev => [createdComment, ...prev]);
      setNewComment('');
      
      // Обновляем счетчик комментариев в посте
      setPost(prev => ({
        ...prev,
        comments_count: prev.comments_count + 1
      }));
    } catch (error) {
      console.error('Ошибка при создании комментария:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="post-detail-overlay">
        <div className="post-detail-modal">
          <div className="post-detail-loading">
            <div className="loading-spinner large"></div>
            <p>Загрузка поста...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-overlay">
        <div className="post-detail-modal">
          <div className="post-detail-error">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="retry-btn" onClick={loadPost}>
                Попробовать снова
              </button>
              <button className="close-btn" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок модального окна */}
        <div className="post-detail-header">
          <h2>Детали поста</h2>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="post-detail-content">
          {/* Основной контент поста */}
          <div className="post-main">
            <div className="post-author">
              <UserAvatar 
                user={post.author}
                size="large"
                className="author-avatar"
              />
              <div className="author-info">
                <h3 className="author-name">
                  {post.author.full_name || post.author.username}
                </h3>
                <span className="post-date">{formatDate(post.created_at)}</span>
              </div>
            </div>

            <div className="post-body">
              <h1 className="post-title">{post.title}</h1>
              <div className="post-text">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {post.image && (
                <div className="post-image">
                  <img 
                    src={getImageUrl(post.image)} 
                    alt={post.title}
                  />
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="post-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Действия с постом */}
            <div className="post-actions">
              <button 
                className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                <svg className="action-icon" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill={isLiked ? 'currentColor' : 'none'}
                  />
                </svg>
                <span>{likesCount}</span>
              </button>
              
              <div className="action-btn">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{post.comments_count}</span>
              </div>
              
              <div className="action-btn">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{post.views_count}</span>
              </div>
            </div>
          </div>

          {/* Секция комментариев */}
          <div className="comments-section">
            <h3 className="comments-title">
              Комментарии ({post.comments_count})
            </h3>
            
            {/* Форма добавления комментария */}
            <form className="comment-form" onSubmit={handleSubmitComment}>
              <textarea
                className="comment-input"
                placeholder="Написать комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              <div className="comment-form-actions">
                <span className="char-count">
                  {newComment.length}/1000
                </span>
                <button 
                  type="submit" 
                  className="submit-comment-btn"
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Отправка...
                    </>
                  ) : (
                    'Отправить'
                  )}
                </button>
              </div>
            </form>
            
            {/* Список комментариев */}
            <CommentsList 
              comments={comments}
              loading={commentsLoading}
              onCommentUpdate={(updatedComment) => {
                setComments(prev => 
                  prev.map(comment => 
                    comment.id === updatedComment.id ? updatedComment : comment
                  )
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;