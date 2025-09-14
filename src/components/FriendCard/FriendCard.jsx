import React from 'react';
import './FriendCard.css';
import { API_BASE_URL } from '../../api/config';

const FriendCard = ({ friend, onSendRequest, showAddButton = false, isRecommendation = false }) => {
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE_URL}${avatarUrl}`;
  };

  const formatInterests = (interests) => {
    if (!interests || !interests.hobby) return [];
    return interests.hobby.slice(0, 3); // Показываем только первые 3 интереса
  };

  const handleAddFriend = () => {
    if (onSendRequest) {
      onSendRequest(friend.id);
    }
  };

  return (
    <div className="friend-card">
      <div className="friend-card-header">
        <div className="friend-avatar">
          {getAvatarUrl(friend.avatar_url) ? (
            <img 
              src={getAvatarUrl(friend.avatar_url)} 
              alt={friend.username}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {friend.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="friend-info">
          <h3 className="friend-name">
            {friend.full_name || friend.username}
          </h3>
          <p className="friend-username">@{friend.username}</p>
          {friend.level > 0 && (
            <div className="friend-level">
              <span className="level-badge">Уровень {friend.level}</span>
            </div>
          )}
        </div>
      </div>

      {friend.bio && (
        <div className="friend-bio">
          <p>{friend.bio.length > 100 ? `${friend.bio.substring(0, 100)}...` : friend.bio}</p>
        </div>
      )}

      {formatInterests(friend.interests).length > 0 && (
        <div className="friend-interests">
          <div className="interests-list">
            {formatInterests(friend.interests).map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {isRecommendation && friend.recommendation_reasons && (
        <div className="recommendation-info">
          <p className="recommendation-reason">
            {friend.recommendation_reasons[0]}
          </p>
          <div className="recommendation-score">
            Совместимость: {Math.round(friend.recommendation_score * 10)}%
          </div>
        </div>
      )}

      {!isRecommendation && (
        <div className="friend-stats">
          <div className="stat-item">
            <span className="stat-value">{friend.diamonds || 0}</span>
            <span className="stat-label">💎</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{friend.coins || 0}</span>
            <span className="stat-label">🪙</span>
          </div>
          {friend.streak_days > 0 && (
            <div className="stat-item">
              <span className="stat-value">{friend.streak_days}</span>
              <span className="stat-label">🔥</span>
            </div>
          )}
        </div>
      )}

      {showAddButton && (
        <div className="friend-actions">
          <button 
            className="add-friend-btn"
            onClick={handleAddFriend}
          >
            Добавить в друзья
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendCard;