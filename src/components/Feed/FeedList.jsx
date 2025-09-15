import React, { useState, useEffect, useCallback } from 'react';
import './FeedList.css';
import PostCard from './PostCard';
import { getPosts, getRecommendations } from '../../api/feed';

const FeedList = ({ 
  feedType = 'all', // 'all', 'recommendations', 'user'
  userId = null,
  searchParams = null,
  onPostClick,
  className = '',
  refreshTrigger = 0
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let response;
      const params = {
        page: pageNum,
        page_size: 10,
        ...searchParams
      };

      switch (feedType) {
        case 'recommendations':
          response = await getRecommendations(params);
          break;
        case 'user':
          // Будет реализовано позже через getUserPosts
          response = await getPosts(params);
          break;
        default:
          response = await getPosts(params);
      }

      const newPosts = response.results || [];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
      setPage(pageNum);
      
    } catch (err) {
      console.error('Ошибка загрузки постов:', err);
      setError(err.message || 'Ошибка загрузки постов');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [feedType, userId, searchParams]);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // Перезагрузка при изменении refreshTrigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadPosts(1, false);
    }
  }, [refreshTrigger, loadPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, true);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleRefresh = () => {
    loadPosts(1, false);
  };

  if (loading && posts.length === 0) {
    return (
      <div className={`feed-list ${className}`}>
        <div className="feed-loading">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="post-skeleton">
              <div className="skeleton-header">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-author">
                  <div className="skeleton-name"></div>
                  <div className="skeleton-time"></div>
                </div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
              <div className="skeleton-actions">
                <div className="skeleton-action"></div>
                <div className="skeleton-action"></div>
                <div className="skeleton-action"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className={`feed-list ${className}`}>
        <div className="feed-error">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRefresh}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`feed-list ${className}`}>
        <div className="feed-empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>Пока нет постов</h3>
          <p>
            {feedType === 'recommendations' 
              ? 'Рекомендации появятся после того, как вы начнете взаимодействовать с постами'
              : 'Здесь будут отображаться посты'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`feed-list ${className}`}>
      {/* Заголовок с информацией */}
      {totalCount > 0 && (
        <div className="feed-header">
          <div className="feed-stats">
            <span className="posts-count">
              {totalCount} {totalCount === 1 ? 'пост' : totalCount < 5 ? 'поста' : 'постов'}
            </span>
            {feedType === 'recommendations' && (
              <span className="feed-type">Рекомендации для вас</span>
            )}
          </div>
          <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
              <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Список постов */}
      <div className="posts-container">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdate={handlePostUpdate}
            onPostClick={onPostClick}
          />
        ))}
      </div>

      {/* Кнопка загрузки еще */}
      {hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <div className="loading-spinner"></div>
                Загрузка...
              </>
            ) : (
              'Загрузить еще'
            )}
          </button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loadingMore && (
        <div className="loading-more">
          <div className="post-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-author">
                <div className="skeleton-name"></div>
                <div className="skeleton-time"></div>
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке при загрузке дополнительных постов */}
      {error && posts.length > 0 && (
        <div className="load-error">
          <p>Ошибка при загрузке: {error}</p>
          <button className="retry-btn small" onClick={() => loadPosts(page + 1, true)}>
            Повторить
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedList;