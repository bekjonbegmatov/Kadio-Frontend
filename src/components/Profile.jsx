import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../api/auth';
import AvatarUpload from './AvatarUpload';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await getUserProfile();
      if (result.success) {
        setProfile(result.data);
        setError('');
      } else {
        setError(result.error || 'Ошибка загрузки профиля');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">{error}</div>
        <button onClick={fetchProfile} className="retry-btn">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error">Профиль не найден</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <AvatarUpload 
              currentAvatar={profile.avatar_url}
              onAvatarUpdate={(newAvatarUrl) => {
                setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
              }}
            />
          </div>
          <div className="profile-info">
            <h2 className="username">{profile.username}</h2>
            <p className="email">{profile.email}</p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Уровень:</span>
                <span className="stat-value">{profile.level}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Дни подряд:</span>
                <span className="stat-value">{profile.streak_days}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-details">
          <div className="bio-section">
            <h3>О себе</h3>
            <p className="bio">{profile.bio || 'Информация не указана'}</p>
          </div>
          
          <div className="interests-section">
            <h3>Интересы</h3>
            <div className="languages">
              <span className="section-label">Языки программирования:</span>
              <div className="language-tags">
                {profile.interests?.languages?.map((lang, index) => (
                  <span key={index} className="language-tag">{lang}</span>
                )) || <span className="no-data">Не указано</span>}
              </div>
            </div>
          </div>
          
          <div className="meta-info">
            <div className="meta-item">
              <span className="meta-label">Часовой пояс:</span>
              <span className="meta-value">{profile.user_time_zone}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Последняя активность:</span>
              <span className="meta-value">
                {new Date(profile.last_active).toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;