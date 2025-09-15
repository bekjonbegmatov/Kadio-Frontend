import React, { useState } from 'react';
import './PostCard.css';
import { API_BASE_URL } from '../../api/config';
import { toggleLike } from '../../api/feed';
import UserAvatar from '../DefaultAvatar/UserAvatar';

const PostCard = ({ post, onPostUpdate, onPostClick, showActions = true }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiking, setIsLiking] = useState(false);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'только что' : `${diffInMinutes} мин назад`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ч назад`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} дн назад`;
      } else {
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await toggleLike(post.id);
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          is_liked: newIsLiked,
          likes_count: newIsLiked ? likesCount + 1 : likesCount - 1
        });
      }
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const truncateContent = (content, maxLength = 300) => {
    if (!content || typeof content !== 'string') return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-card" onClick={handlePostClick}>
      <div className="post-header">
        <div className="post-author">
          <UserAvatar 
            user={post.author}
            size="medium"
            className="author-avatar"
          />
          <div className="author-info">
            <h4 className="author-name">
              {post.author.full_name || post.author.username}
            </h4>
            <span className="post-time">{formatDate(post.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">
          {truncateContent(post.content_preview || post.content)}
        </p>
        
        {post.image && (
          <div className="post-image">
            <img 
              src={getImageUrl(post.image)} 
              alt={post.title}
              loading="lazy"
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

      {showActions && (
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
          
          <button className="action-btn comment-btn">
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
          </button>
          
          <div className="action-btn views-count">
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
      )}
    </div>
  );
};

export default PostCard;