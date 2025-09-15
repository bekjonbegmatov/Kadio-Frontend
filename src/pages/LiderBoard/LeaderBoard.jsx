import React, { useState, useEffect } from 'react';
import { getGlobalLeaderboard, getFriendsLeaderboard } from '../../api/game';
import { getCurrentUser } from '../../api/auth';
import { BASE_URL } from '../../api/config';
import DefaultAvatar from '../../components/DefaultAvatar/DefaultAvatar';
import './LeaderBoard.css';

import coinIcon from '../../assets/img/coin.png';

const LeaderBoard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [globalData, setGlobalData] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('coins');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadLeaderboardData();
  }, [activeTab]);

  useEffect(() => {
    // Пересортировка данных при изменении параметра сортировки
  }, [sortBy]);

  const loadCurrentUser = () => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Ошибка при получении текущего пользователя:', error);
    }
  };

  const loadLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (activeTab === 'global') {
        result = await getGlobalLeaderboard(100);
        if (result.success) {
          setGlobalData(result.data);
        }
      } else {
        result = await getFriendsLeaderboard(100);
        if (result.success) {
          setFriendsData(result.data);
        }
      }
      
      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      if (sortBy === 'coins') {
        return b.coins - a.coins;
      } else if (sortBy === 'diamonds') {
        return b.diamonds - a.diamonds;
      }
      return 0;
    });
  };

  const getCurrentData = () => {
    const data = activeTab === 'global' ? globalData : friendsData;
    return sortData(data);
  };

  const generateAvatarColor = (email) => {
    let hash = 0;
    const str = email || 'default';
    
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return position;
    }
  };

  const isCurrentUser = (user) => {
    return currentUser && user.id === currentUser.id;
  };

  const renderLeaderboardItem = (user, index) => {
    const position = index + 1;
    const isTop3 = position <= 3;
    const isCurrent = isCurrentUser(user);
    
    return (
      <div 
        key={user.id} 
        className={`leaderboard-item ${
          isTop3 ? `top-${position}` : ''
        } ${isCurrent ? 'current-user' : ''}`}
      >
        <div className="rank">
          <span className={`rank-number ${isTop3 ? 'top-rank' : ''}`}>
            {getRankIcon(position)}
          </span>
        </div>
        
        <div className="user-avatar">
          {user.avatar && user.avatar.trim() ? (
            <img 
              src={`${BASE_URL}${user.avatar}`} 
              alt={user.email}
              className="avatar-image"
            />
          ) : (
            <div 
              className="default-avatar"
              style={{ backgroundColor: generateAvatarColor(user.email) }}
            >
              {getInitial(user.email)}
            </div>
          )}
        </div>
        
        <div className="user-info">
          <div className="user-email">{user.email}</div>
          {isCurrent && <div className="current-label">Это вы</div>}
        </div>
        
        <div className="user-stats">
          <div className="stat coins">
            <span className="stat-icon">
              <img src={coinIcon} width={35} alt="" />
            </span>
            <span className="stat-value">{user.coins}</span>
          </div>
          <div className="stat diamonds">
            <span className="stat-icon">💎</span>
            <span className="stat-value">{user.diamonds}</span>
          </div>
        </div>
      </div>
    );
  };

  const currentData = getCurrentData();

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>Лидерборд</h1>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            Глобальный
          </button>
          <button 
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Среди друзей
          </button>
        </div>
        
        <div className="sort-controls">
          <label>Сортировать по:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="coins">Монеты</option>
            <option value="diamonds">Алмазы</option>
          </select>
        </div>
      </div>
      
      <div className="leaderboard-content">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p>Ошибка: {error}</p>
            <button onClick={loadLeaderboardData} className="retry-btn">
              Попробовать снова
            </button>
          </div>
        )}
        
        {!loading && !error && currentData.length === 0 && (
          <div className="empty-container">
            <p>Нет данных для отображения</p>
          </div>
        )}
        
        {!loading && !error && currentData.length > 0 && (
          <div className="leaderboard-list">
            {currentData.map((user, index) => renderLeaderboardItem(user, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderBoard;