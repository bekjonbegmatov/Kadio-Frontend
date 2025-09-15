import React, { useState } from 'react';
import UserAvatar from '../DefaultAvatar/UserAvatar';
import './Feed.css';

const CommentsList = ({ 
  comments = [], 
  loading = false, 
  onCommentUpdate = () => {},
  currentUserId = null 
}) => {
  const [expandedComments, setExpandedComments] = useState(new Set());

  const toggleCommentExpansion = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="comments-loading">
        <div className="comment-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-content">
            <div className="skeleton-author"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
        <div className="comment-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-content">
            <div className="skeleton-author"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="no-comments">
        <div className="no-comments-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p>Пока нет комментариев</p>
        <span>Будьте первым, кто оставит комментарий!</span>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map((comment) => {
        const isExpanded = expandedComments.has(comment.id);
        const isLongComment = comment.content && comment.content.length > 200;
        const displayContent = isLongComment && !isExpanded 
          ? comment.content.substring(0, 200) + '...' 
          : comment.content;

        return (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <UserAvatar 
                user={comment.author} 
                size={32}
                className="comment-avatar"
              />
              <div className="comment-meta">
                <span className="comment-author">
                  {comment.author?.first_name} {comment.author?.last_name}
                </span>
                <span className="comment-date">
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>
            
            <div className="comment-content">
              <p>{displayContent}</p>
              {isLongComment && (
                <button 
                  className="expand-comment-btn"
                  onClick={() => toggleCommentExpansion(comment.id)}
                >
                  {isExpanded ? 'Свернуть' : 'Показать полностью'}
                </button>
              )}
            </div>

            {comment.author?.id === currentUserId && (
              <div className="comment-actions">
                <button className="comment-action-btn edit-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="comment-action-btn delete-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentsList;