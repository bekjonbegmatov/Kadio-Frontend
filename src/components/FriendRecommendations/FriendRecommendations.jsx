import React, { useState, useEffect } from 'react';
import './FriendRecommendations.css';
import FriendCard from '../FriendCard/FriendCard';
import { getFriendRecommendations, sendFriendRequest } from '../../api/friends';

const FriendRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFriendRecommendations(10);
      if (result.success) {
        setRecommendations(result.data.recommendations || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Ошибка при загрузке рекомендаций');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    setSendingRequest(userId);
    
    try {
      const result = await sendFriendRequest(userId);
      if (result.success) {
        // Удаляем пользователя из рекомендаций после отправки запроса
        setRecommendations(prev => prev.filter(user => user.id !== userId));
        // Можно добавить уведомление об успехе
      } else {
        setError('Ошибка при отправке запроса в друзья');
      }
    } catch (err) {
      setError('Ошибка при отправке запроса в друзья');
    } finally {
      setSendingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Рекомендуемые друзья</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Ищем подходящих друзей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Рекомендуемые друзья</h2>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Произошла ошибка при загрузке рекомендаций</p>
          <button className="retry-btn" onClick={loadRecommendations}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Рекомендуемые друзья</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Пока нет подходящих друзей</h3>
          <p>
            Будьте активными и заполните профиль! Добавьте интересы, 
            загрузите аватар и расскажите о себе, чтобы мы могли 
            найти для вас подходящих друзей.
          </p>
          <button className="refresh-btn" onClick={loadRecommendations}>
            Обновить рекомендации
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Рекомендуемые друзья</h2>
        <p className="recommendations-subtitle">
          Найдено {recommendations.length} подходящих пользователей
        </p>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map((user) => (
          <FriendCard
            key={user.id}
            friend={user}
            showAddButton={true}
            isRecommendation={true}
            onSendRequest={handleSendRequest}
            disabled={sendingRequest === user.id}
          />
        ))}
      </div>
      
      <div className="recommendations-footer">
        <button className="load-more-btn" onClick={loadRecommendations}>
          Обновить рекомендации
        </button>
      </div>
    </div>
  );
};

export default FriendRecommendations;