import React, { useState, useEffect } from 'react';
import { getUserFriends, searchUsers, sendFriendRequest } from '../../api/friends';
import { getCurrentUser } from '../../api/auth';
import { getChatRoom } from '../../api/chat.js';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/config';
import DefaultAvatar from '../../components/DefaultAvatar/DefaultAvatar';
import FriendRecommendations from '../../components/FriendRecommendations/FriendRecommendations';
import FriendRequests from '../../components/FriendRequests/FriendRequests';
import './FrendsPage.css';

const FrendsPage = () => {
  // Добавляем стили при монтировании компонента
  useEffect(() => {
    const existingStyle = document.getElementById('frends-search-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'frends-search-styles';
      style.textContent = `
        .search-container {
          margin-bottom: 20px;
        }
        
        .search-input-group {
          display: flex;
          gap: 10px;
          align-items: center;
          position: relative;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 25px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s ease;
        }
        
        .search-input:focus {
          border-color: #007bff;
        }
        
        .search-loading {
          position: absolute;
          right: 15px;
          color: #007bff;
          font-size: 14px;
        }
        
        .search-results {
          margin-top: 20px;
        }
        
        .results-count {
          margin-bottom: 15px;
          color: #666;
          font-size: 14px;
        }
        
        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .search-result-row {
          display: flex;
          align-items: center;
          padding: 15px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .search-result-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .search-placeholder {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        
        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .search-placeholder h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .search-placeholder p {
          margin: 0;
          font-size: 14px;
        }
        
        .user-stats {
          margin-top: 8px;
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #666;
        }
        
        .add-friend-btn {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-right: 8px;
        }
        
        .add-friend-btn:hover {
           background: #218838;
         }
         
         .add-friend-btn.request-sent {
           background: #6c757d;
           cursor: not-allowed;
         }
         
         .add-friend-btn.loading {
           background: #17a2b8;
           cursor: not-allowed;
         }
         
         .loading-spinner {
           display: inline-block;
           width: 12px;
           height: 12px;
           border: 2px solid #ffffff;
           border-radius: 50%;
           border-top-color: transparent;
           animation: spin 1s ease-in-out infinite;
           margin-right: 6px;
         }
         
         @keyframes spin {
           to { transform: rotate(360deg); }
         }
         
         .highlight {
           background-color: #ffeb3b;
           color: #333;
           padding: 1px 2px;
           border-radius: 2px;
           font-weight: bold;
         }
      `;
      document.head.appendChild(style);
    }
  }, []);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем текущего пользователя
        const userResult = await getCurrentUser();
        if (userResult.success) {
          setCurrentUser(userResult.data);
        }

        // Получаем друзей и запросы
        const result = await getUserFriends();
        console.log('API Response:', result); // Отладочная информация
        
        if (result.success) {
          console.log('Friends data:', result.data);
          console.log('Current user ID:', userResult.data?.id);
          
          // API возвращает массив объектов с from_user, to_user, status, created_at
          const friendsData = result.data || [];
          
          // Фильтруем принятые запросы в друзья
          const acceptedFriends = friendsData.filter(
            friendship => friendship.status === 'accepted'
          );
          
          console.log('Accepted friends:', acceptedFriends);
          
          // Извлекаем данные друзей (берем пользователя, который не является текущим)
          const friends = acceptedFriends.map(friendship => {
            const currentUserId = userResult.data?.id;
            if (friendship.from_user.id === currentUserId) {
              return friendship.to_user;
            } else {
              return friendship.from_user;
            }
          });
          
          console.log('Final friends data:', friends);
          
          setFriends(friends);
          setFriendRequests(friendsData); // Все запросы для компонента FriendRequests
          setUsers([]); // Больше не используется
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderFriendRow = (friend) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'Не указана';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    };

    return (
      <tr key={friend.id} className="friend-row">
        <td className="friend-avatar">
          {friend.avatar_url && friend.avatar_url.trim() && friend.avatar_url.trim() !== '' ? (
            <img 
              src={`${BASE_URL}${friend.avatar_url}`} 
              alt={friend.full_name || friend.username}
              className="avatar-image"
            />
          ) : (
            <DefaultAvatar 
              email={friend.email || friend.username}
              name={friend.full_name || friend.username}
              size={40}
            />
          )}
        </td>
        <td className="friend-name">
          <div className="name-info">
            <span className="full-name">{friend.full_name || friend.username}</span>
            <span className="username">@{friend.username}</span>
          </div>
        </td>
        <td className="friend-email">{friend.email || 'Не указан'}</td>
        <td className="friend-birth-date">{formatDate(friend.date_of_birth)}</td>
        <td className="friend-actions">
          <button 
            className="message-btn"
            onClick={() => handleStartChat(friend.id)}
          >
            Написать сообщение
          </button>
        </td>
      </tr>
    );
  };

  const handleStartChat = async (friendId) => {
    try {
      const chatRoom = await getChatRoom(friendId);
      navigate(`/chats/${chatRoom.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Ошибка при создании чата');
    }
  };

  const renderSearchResult = (user) => (
    <div key={user.id} className="search-result-row">
      <div className="friend-avatar">
        {user.avatar_url && user.avatar_url.trim() && user.avatar_url.trim() !== '' ? (
          <img 
            src={`${BASE_URL}${user.avatar_url}`} 
            alt={user.full_name || user.username}
            className="avatar-image"
          />
        ) : (
          <DefaultAvatar 
            email={user.email || user.username}
            name={user.full_name || user.username}
            size={40}
          />
        )}
      </div>
      <div className="friend-info">
        <h3>{highlightSearchTerm(user.full_name || user.username, searchQuery)}</h3>
        <p className="friend-username">@{highlightSearchTerm(user.username, searchQuery)}</p>
        {user.bio && <p className="friend-bio">{highlightSearchTerm(user.bio, searchQuery)}</p>}
        {user.interests && user.interests.hobby && user.interests.hobby.length > 0 && (
          <div className="friend-interests">
            <span className="interests-label">Интересы:</span>
            <div className="interests-tags">
              {user.interests.hobby.map((interest, index) => (
                <span key={index} className="interest-tag">
                  {highlightSearchTerm(interest, searchQuery)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="user-stats">
          <span className="user-level">Уровень: {user.level}</span>
          {user.last_active && (
            <span className="last-active">
              Последняя активность: {new Date(user.last_active).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="friend-actions">
        <button 
          className={`add-friend-btn ${user.friendRequestSent ? 'request-sent' : ''} ${user.isLoading ? 'loading' : ''}`}
          onClick={() => handleAddFriend(user)}
          disabled={user.friendRequestSent || user.isLoading}
        >
          {user.isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Отправка...
            </>
          ) : user.friendRequestSent ? (
            '✓ Запрос отправлен'
          ) : (
            '➕ Добавить в друзья'
          )}
        </button>
      </div>
    </div>
  );

  const handleAddFriend = async (user) => {
    try {
      // Обновляем состояние кнопки сразу для показа анимации
      setSearchResults(prevResults => 
        prevResults.map(result => 
          result.id === user.id 
            ? { ...result, friendRequestSent: true, isLoading: true }
            : result
        )
      );

      const response = await sendFriendRequest(user.id);
      
      if (response.success) {
        // Успешно отправлен запрос
        setSearchResults(prevResults => 
          prevResults.map(result => 
            result.id === user.id 
              ? { ...result, friendRequestSent: true, isLoading: false }
              : result
          )
        );
      } else {
        // Проверяем, если запрос уже существует
        const errorMessage = response.error?.error || response.error || '';
        if (errorMessage.includes('already exists')) {
          // Запрос уже отправлен - просто показываем состояние "отправлен"
          setSearchResults(prevResults => 
            prevResults.map(result => 
              result.id === user.id 
                ? { ...result, friendRequestSent: true, isLoading: false }
                : result
            )
          );
        } else {
          // Другая ошибка при отправке
          setSearchResults(prevResults => 
            prevResults.map(result => 
              result.id === user.id 
                ? { ...result, friendRequestSent: false, isLoading: false }
                : result
            )
          );
          setError('Ошибка при отправке запроса на добавление в друзья');
        }
      }
    } catch (error) {
      // Проверяем ошибку в catch блоке тоже
      const errorMessage = error.response?.data?.error || error.message || '';
      if (errorMessage.includes('already exists')) {
        // Запрос уже отправлен - просто показываем состояние "отправлен"
        setSearchResults(prevResults => 
          prevResults.map(result => 
            result.id === user.id 
              ? { ...result, friendRequestSent: true, isLoading: false }
              : result
          )
        );
      } else {
        // Восстанавливаем состояние при других ошибках
        setSearchResults(prevResults => 
          prevResults.map(result => 
            result.id === user.id 
              ? { ...result, friendRequestSent: false, isLoading: false }
              : result
          )
        );
        setError('Ошибка при отправке запроса на добавление в друзья');
      }
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const result = await getUserFriends();
      
      if (result.success) {
        // API возвращает массив объектов с from_user, to_user, status, created_at
        const friendsData = result.data || [];
        
        // Фильтруем принятые запросы в друзья
        const acceptedFriends = friendsData.filter(
          friendship => friendship.status === 'accepted'
        );
        
        // Извлекаем данные друзей (берем пользователя, который не является текущим)
        const friends = acceptedFriends.map(friendship => {
          const currentUserId = currentUser?.id;
          if (friendship.from_user.id === currentUserId) {
            return friendship.to_user;
          } else {
            return friendship.from_user;
          }
        });
        
        setFriends(friends);
        setFriendRequests(friendsData); // Все запросы для компонента FriendRequests
        setUsers([]); // Больше не используется
      }
    } catch (err) {
      setError('Ошибка при обновлении данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchUsers(searchTerm);
      if (result.success) {
        setSearchResults(result.data.results || result.data || []);
      } else {
        setError('Ошибка при поиске пользователей');
      }
    } catch (err) {
      setError('Ошибка при поиске пользователей');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Автоматический поиск при вводе
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  // Функция для подсветки найденных слов
  const highlightSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return <span key={index} className="highlight">{part}</span>;
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="friends-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загружаем ваших друзей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Произошла ошибка</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={refreshData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const pendingRequests = friendRequests.filter(req => req.status === 'pending');
  const hasRequests = pendingRequests.length > 0;

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Друзья</h1>
        
        <div className="friends-navigation">
          <button 
            className={`nav-btn ${activeSection === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveSection('friends')}
          >
            Мои друзья ({friends.length})
          </button>
          <button 
            className={`nav-btn ${activeSection === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveSection('requests')}
          >
            Запросы {hasRequests && <span className="badge">{pendingRequests.length}</span>}
          </button>
          <button 
            className={`nav-btn ${activeSection === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveSection('recommendations')}
          >
            Рекомендации
          </button>
          <button 
            className={`nav-btn ${activeSection === 'search' ? 'active' : ''}`}
            onClick={() => setActiveSection('search')}
          >
            Поиск ({searchResults.length})
          </button>
        </div>
      </div>

      <div className="friends-content">
        {activeSection === 'friends' && (
          <div className="friends-section">
            {friends.length > 0 ? (
              <>
                <div className="section-header">
                  <h2>Ваши друзья</h2>
                  <p>У вас {friends.length} {friends.length === 1 ? 'друг' : friends.length < 5 ? 'друга' : 'друзей'}</p>
                </div>
                <div className="friends-table-container">
                  <table className="friends-table">
                    <thead>
                      <tr>
                        <th>Аватар</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Дата рождения</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {friends.map(renderFriendRow)}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty-friends">
                <div className="empty-icon">👥</div>
                <h3>У вас пока нет друзей</h3>
                <p>
                  Начните добавлять друзей! Перейдите в раздел "Рекомендации" 
                  или "Запросы", чтобы найти новых друзей.
                </p>
                <div className="empty-actions">
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveSection('recommendations')}
                  >
                    Найти друзей
                  </button>
                  {hasRequests && (
                    <button 
                      className="secondary-btn"
                      onClick={() => setActiveSection('requests')}
                    >
                      Посмотреть запросы
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'requests' && (
          <div className="requests-section">
            <FriendRequests 
              currentUserId={currentUser?.id}
              onRequestProcessed={refreshData}
            />
          </div>
        )}

        {activeSection === 'recommendations' && (
          <div className="recommendations-section">
            <FriendRecommendations onRequestSent={refreshData} />
          </div>
        )}

        {activeSection === 'search' && (
          <div className="search-section">
            <div className="section-header">
              <h2>Поиск пользователей</h2>
              <div className="search-container">
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="Поиск по email, имени или интересам..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="search-input"
                  />
                  {isSearching && <div className="search-loading">Поиск...</div>}
                </div>
              </div>
            </div>
            
            {searchQuery && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <>
                    <p className="results-count">Найдено пользователей: {searchResults.length}</p>
                    <div className="search-results-list">
                      {searchResults.map(user => renderSearchResult(user))}
                    </div>
                  </>
                ) : (
                  !isSearching && (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <h3>Пользователи не найдены</h3>
                      <p>Попробуйте изменить поисковый запрос</p>
                    </div>
                  )
                )}
              </div>
            )}
            
            {!searchQuery && (
              <div className="search-placeholder">
                <div className="placeholder-icon">👥</div>
                <h3>Начните поиск</h3>
                <p>Введите email, имя или интересы для поиска пользователей</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FrendsPage;