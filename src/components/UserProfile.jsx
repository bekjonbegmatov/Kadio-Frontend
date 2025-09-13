import React from 'react';
import { FiUser, FiAward, FiZap, FiHexagon } from 'react-icons/fi';
import './UserProfile.css';

const UserProfile = () => {
  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            <FiUser />
          </div>
          <div className="status-indicator online"></div>
        </div>
        <div className="profile-info">
          <h3>Александр Петров</h3>
          <p className="role">Дизайнер</p>
          <p className="status">В отпуске до четверга</p>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-icon"><FiHexagon /></div>
          <div className="stat-info">
            <span className="stat-value">40</span>
            <span className="stat-label">Алмазы</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-info">
            <span className="stat-value">12</span>
            <span className="stat-label">Достижения</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon"><FiZap /></div>
          <div className="stat-info">
            <span className="stat-value">35</span>
            <span className="stat-label">Энергия</span>
          </div>
        </div>
      </div>
      
      <div className="profile-details">
        <div className="detail-row">
          <span className="detail-label">День рождения:</span>
          <span className="detail-value">29 сентября</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Должность:</span>
          <span className="detail-value">Дизайнер</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Отдел:</span>
          <span className="detail-value">Отдел скриптологии</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">В компании:</span>
          <span className="detail-value">с 17 января 2024 г.</span>
        </div>
      </div>
      
      <div className="profile-actions">
        <button className="btn btn-primary">Отправить</button>
        <button className="btn btn-secondary">Профиль</button>
      </div>
    </div>
  );
};

export default UserProfile;