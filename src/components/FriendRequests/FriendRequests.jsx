import React, { useState, useEffect } from 'react';
import './FriendRequests.css';
import { getFriendRequests, sendFriendRequest } from '../../api/friends';
import { BASE_URL } from '../../api/config';
import DefaultAvatar from '../DefaultAvatar/DefaultAvatar';

const FriendRequests = ({ currentUserId }) => {
  const [requests, setRequests] = useState({
    incoming: [],
    outgoing: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('incoming');
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [currentUserId]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFriendRequests();
      
      if (result.success) {
        // API возвращает объект с incoming_requests и outgoing_requests
        const data = result.data || {};
        const incomingRequests = data.incoming_requests || [];
        const outgoingRequests = data.outgoing_requests || [];
        
        // Преобразуем данные для отображения
        const incoming = incomingRequests.map(request => ({
          ...request,
          user: request.from_user
        }));
        
        const outgoing = outgoingRequests.map(request => ({
          ...request,
          user: request.to_user
        }));
        
        setRequests({ incoming, outgoing });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Ошибка при загрузке запросов');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    setProcessingRequest(userId);
    
    try {
      // Отправляем встречный запрос для принятия
      const result = await sendFriendRequest(userId);
      if (result.success) {
        // Обновляем список запросов
        await loadRequests();
      } else {
        setError('Ошибка при принятии запроса');
      }
    } catch (err) {
      setError('Ошибка при принятии запроса');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl || !avatarUrl.trim()) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${BASE_URL}${avatarUrl}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequestRow = (request, isIncoming) => {
    const { user } = request;
    
    return (
      <tr key={`${request.from_user.id}-${request.to_user.id}`} className="request-row">
        <td className="avatar-cell">
          {getAvatarUrl(user.avatar_url) ? (
            <img 
              src={getAvatarUrl(user.avatar_url)} 
              alt={user.username}
              className="avatar-image"
            />
          ) : (
            <DefaultAvatar user={user} size={40} />
          )}
        </td>
        <td className="name-cell">
          <div className="user-info">
            <div className="full-name">{user.full_name || user.username}</div>
            <div className="username">@{user.username}</div>
          </div>
        </td>
        <td className="email-cell">
          {user.email || 'Не указан'}
        </td>
        <td className="birth-date-cell">
          {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('ru-RU') : 'Не указана'}
        </td>
        <td className="request-date-cell">
          {formatDate(request.created_at)}
        </td>
        <td className="actions-cell">
          {isIncoming ? (
            <button 
              className="accept-btn"
              onClick={() => handleAcceptRequest(user.id)}
              disabled={processingRequest === user.id}
            >
              {processingRequest === user.id ? 'Принимаем...' : 'Принять'}
            </button>
          ) : (
            <button className="message-btn" disabled>
              Написать сообщение
            </button>
          )}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="requests-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загружаем запросы...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="requests-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Произошла ошибка при загрузке запросов</p>
          <button className="retry-btn" onClick={loadRequests}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const hasRequests = requests.incoming.length > 0 || requests.outgoing.length > 0;

  if (!hasRequests) {
    return (
      <div className="requests-container">
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h3>Нет запросов в друзья</h3>
          <p>
            Здесь будут отображаться входящие и исходящие запросы в друзья.
            Начните добавлять друзей из рекомендаций!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h2>Запросы в друзья</h2>
        <div className="requests-tabs">
          <button 
            className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            Входящие ({requests.incoming.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('outgoing')}
          >
            Исходящие ({requests.outgoing.length})
          </button>
        </div>
      </div>

      <div className="requests-content">
        {activeTab === 'incoming' && (
          <div className="requests-table-container">
            {requests.incoming.length > 0 ? (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Аватар</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Дата рождения</th>
                    <th>Дата запроса</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.incoming.map(request => renderRequestRow(request, true))}
                </tbody>
              </table>
            ) : (
              <div className="empty-tab">
                <p>Нет входящих запросов</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className="requests-table-container">
            {requests.outgoing.length > 0 ? (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Аватар</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Дата рождения</th>
                    <th>Дата запроса</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.outgoing.map(request => renderRequestRow(request, false))}
                </tbody>
              </table>
            ) : (
              <div className="empty-tab">
                <p>Нет исходящих запросов</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;