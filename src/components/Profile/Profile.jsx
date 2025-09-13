import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../api/auth';

import './Profile.css';

import UserActivity from './charts/UserActivity';

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
      <div className="profile_div">
        <div className="profile_things">
          <div className="profile_photo">
            <img src={profile.avatar_url || null} width={300} alt="" srcSet="" />
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
      

    </div>
  );
};

export default Profile;