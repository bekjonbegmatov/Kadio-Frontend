import React, { useState, useEffect } from 'react';
import { getUserFriends } from '../../api/friends';
import { getCurrentUser } from '../../api/auth';
import { getChatRoom } from '../../api/chat.js';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/config';
import DefaultAvatar from '../../components/DefaultAvatar/DefaultAvatar';
import FriendRecommendations from '../../components/FriendRecommendations/FriendRecommendations';
import FriendRequests from '../../components/FriendRequests/FriendRequests';
import './FrendsPage.css';

const FrendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('friends');
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
      </div>
    </div>
  );
};

export default FrendsPage;