import React, { useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import { useProfile } from '../../store/ProfileContext';
import ProfileEditForm from './ProfileEditForm';
import MarkdownText from './MarkdownText';
import './Profile.css';

import UserActivity from './charts/UserActivity';

const Profile = () => {
  const { profile, loading, error, refreshProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
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
        <button onClick={refreshProfile} className="retry-btn">
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
      <div className="profile-header">
        <h2>Профиль</h2>
        <button 
          className="edit-profile-btn" 
          onClick={handleEditClick}
          title="Редактировать профиль"
        >
          <FiEdit /> Редактировать
        </button>
      </div>
      
      <div className="profile_div">
        <div className="profile_things">
          <div className="profile_photo">
            <img src={profile.avatar_url && profile.avatar_url.trim() ? profile.avatar_url : null} width={300} alt="" />
          </div>

          <div className="user_hobbys">
            <h3>Интересы</h3>
            <div className="hobby_tags">
              {profile.interests?.hobby?.map((hobby, index) => (
                <span key={index} className="hobby_tag">{hobby}</span>
              )) || <span className="no-data">Не указано</span>}
            </div>
          </div>
        </div>

        <div className="profile_info">
          <UserActivity />
        </div>
      </div>

      <div className="user_full_info">
          <div className="info_item">
            <label className="info_label">
              <strong>
                Полное имя:
              </strong>
            </label>
            <span className="info_value">{profile.full_name || "Не указано"}</span>
          </div>
          <div className="info_item">
            <label className="info_label">
              <strong>
                Имя пользователя:
              </strong>
            </label>
            <span className="info_value">{profile.username || "Не указано"}</span>
          </div>
          <div className="info_item">
            <label className="info_label">
              <strong>
                Часовой пояс:
              </strong>
            </label>
            <span className="info_value">{profile.user_time_zone || "Не указано"}</span>
          </div>
          <div className="info_item">
            <label className="info_label">
              <strong>
                Дата рождения:
              </strong>
            </label>
            <span className="info_value">{profile.date_of_birth || "Не указано"}</span>
          </div>
          <div className="info_item">
            <label className="info_label">
              <strong>
                Email:
              </strong>
            </label>  
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className="info_link">{profile.email}</a>
            ) : (
              <span className="info_value">
                <strong>
                  Не указано
                </strong>
              </span>
            )}
          </div>
          <div className="info_item">
            <label className="info_label">
              <strong>
                Telegram:
              </strong>
            </label>
            {profile.link ? (
              <a href={`https://t.me/${profile.link}`} target="_blank" rel="noopener noreferrer" className="telegram_button">
                <span className="telegram_icon">📱</span>
                {profile.link}
              </a>
            ) : (
              <span className="info_value">Не указано</span>
            )}
          </div>
          <div className="info_item bio_item">
            <label className="info_label">
              <strong>
                О себе:
              </strong>
            </label>
            <div className="info_value bio_text">
              {profile.bio ? (
                <MarkdownText text={profile.bio} />
              ) : (
                <span>Не указано</span>
              )}
            </div>
          </div>
      </div>
      
      <ProfileEditForm 
        isOpen={isEditing} 
        onClose={handleEditClose} 
      />
    </div>
  );
};

export default Profile;