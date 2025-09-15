import React, { useState, useEffect } from 'react';
import './Feed.css';
import FeedList from './FeedList';
import CreatePost from './CreatePost';
import PostDetail from './PostDetail';
import { searchPosts } from '../../api/feed';

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Поиск постов
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const results = await searchPosts(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setSearchResults({ results: [], count: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  // Очистка поиска
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Обработка создания нового поста
  const handlePostCreated = (newPost) => {
    setShowCreatePost(false);
    // Обновляем ленту
    setRefreshTrigger(prev => prev + 1);
  };

  // Обработка клика на пост
  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  // Закрытие детального просмотра поста
  const handleClosePostDetail = () => {
    setSelectedPost(null);
  };

  // Обработка нажатия Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedPost) {
          setSelectedPost(null);
        } else if (showCreatePost) {
          setShowCreatePost(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost, showCreatePost]);

  return (
    <div className="feed-container">
      {/* Заголовок и панель управления */}
      <div className="feed-header">
        <div className="feed-title-section">
          <h1 className="feed-title">Лента постов</h1>
          <p className="feed-subtitle">
            Делитесь своими мыслями и открывайте интересные истории
          </p>
        </div>

        <div className="feed-controls">
          {/* Поиск */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Поиск постов..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={clearSearch}
                  title="Очистить поиск"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {isSearching && (
              <div className="search-loading">
                <div className="loading-spinner small"></div>
              </div>
            )}
          </div>

          {/* Кнопка создания поста */}
          <button
            className="create-post-btn"
            onClick={() => setShowCreatePost(true)}
          >
            <svg className="create-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Создать пост
          </button>
        </div>
      </div>

      {/* Результаты поиска или обычная лента */}
      <div className="feed-content">
        {searchResults ? (
          <div className="search-results">
            <div className="search-results-header">
              <h2>
                Результаты поиска по запросу "{searchQuery}"
                {searchResults.count > 0 && (
                  <span className="results-count">({searchResults.count})</span>
                )}
              </h2>
              <button className="clear-search-link" onClick={clearSearch}>
                Показать все посты
              </button>
            </div>
            
            {searchResults.results && searchResults.results.length > 0 ? (
              <FeedList
                posts={searchResults.results}
                onPostClick={handlePostClick}
                isSearchResults={true}
              />
            ) : (
              <div className="no-search-results">
                <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35"/>
                </svg>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос или просмотрите все посты</p>
                <button className="view-all-btn" onClick={clearSearch}>
                  Показать все посты
                </button>
              </div>
            )}
          </div>
        ) : (
          <FeedList
            onPostClick={handlePostClick}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>

      {/* Модальные окна */}
      {showCreatePost && (
        <CreatePost
          onPostCreated={handlePostCreated}
          onClose={() => setShowCreatePost(false)}
        />
      )}

      {selectedPost && (
        <PostDetail
          postId={selectedPost.id}
          onClose={handleClosePostDetail}
        />
      )}
    </div>
  );
};

export default Feed;