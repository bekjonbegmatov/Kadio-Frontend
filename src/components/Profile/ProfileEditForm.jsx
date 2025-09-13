import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiPlus, FiTrash2, FiCamera } from 'react-icons/fi';
import { useProfile } from '../../store/ProfileContext';
import { updateProfile, uploadAvatar } from '../../api/auth';
import './ProfileEditForm.css';

const ProfileEditForm = ({ isOpen, onClose }) => {
  const { profile, updateProfile: updateProfileContext, refreshProfile } = useProfile();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    bio: '',
    user_time_zone: '',
    date_of_birth: '',
    link: '',
    interests: { hobby: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        user_time_zone: profile.user_time_zone || '',
        date_of_birth: profile.date_of_birth || '',
        link: profile.link || '',
        interests: {
          hobby: profile.interests?.hobby || []
        }
      });
    }
  }, [profile, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddHobby = () => {
    if (newHobby.trim() && !formData.interests.hobby.includes(newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: {
          ...prev.interests,
          hobby: [...prev.interests.hobby, newHobby.trim()]
        }
      }));
      setNewHobby('');
    }
  };

  const handleRemoveHobby = (hobbyToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        hobby: prev.interests.hobby.filter(hobby => hobby !== hobbyToRemove)
      }
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла (максимум 5МБ)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Размер файла не должен превышать 5МБ');
        return;
      }

      // Проверка типа файла
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
        return;
      }

      setAvatarFile(file);
      
      // Создание превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(avatarFile);
      if (result.success) {
        await refreshProfile();
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        setError(result.error || 'Ошибка загрузки аватара');
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке аватара');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        updateProfileContext(result.data);
        await refreshProfile();
        onClose();
      } else {
        setError(result.error || 'Ошибка обновления профиля');
      }
    } catch (err) {
      setError('Произошла ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-edit-overlay">
      <div className="profile-edit-modal">
        <div className="modal-header">
          <h3>Редактировать профиль</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          {error && <div className="error-message">{error}</div>}

          <div className="avatar-section">
            <div className="avatar-upload">
              <div className="avatar-preview" onClick={handleAvatarClick}>
                <img 
                  src={avatarPreview || profile?.avatar_url || '/default-avatar.png'} 
                  alt="Avatar" 
                  className="avatar-image"
                />
                <div className="avatar-overlay">
                  <FiCamera />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {avatarFile && (
                <button 
                  type="button" 
                  onClick={handleUploadAvatar} 
                  disabled={uploadingAvatar}
                  className="upload-avatar-btn"
                >
                  {uploadingAvatar ? 'Загрузка...' : 'Загрузить аватар'}
                </button>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="full_name">Полное имя</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_of_birth">Дата рождения</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="user_time_zone">Часовой пояс</label>
              <input
                type="text"
                id="user_time_zone"
                name="user_time_zone"
                value={formData.user_time_zone}
                onChange={handleInputChange}
                placeholder="Например: Asia/Irkutsk"
              />
            </div>

            <div className="form-group">
              <label htmlFor="link">Telegram ссылка</label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://t.me/username"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="bio">О себе</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Расскажите о себе...\n\nВы можете использовать:\n**жирный текст** или __жирный текст__\n*курсив* или _курсив_\n~~зачеркнутый~~\n`код`"
            />
            <div className="markdown-hint">
              💡 Поддерживается базовый Markdown: **жирный**, *курсив*, ~~зачеркнутый~~, `код`
            </div>
          </div>

          <div className="form-group full-width">
            <label>Интересы</label>
            <div className="hobbies-section">
              <div className="add-hobby">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  placeholder="Добавить интерес"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHobby())}
                />
                <button type="button" onClick={handleAddHobby} className="add-hobby-btn">
                  <FiPlus />
                </button>
              </div>
              <div className="hobbies-list">
                {formData.interests.hobby.map((hobby, index) => (
                  <div key={index} className="hobby-item">
                    <span>{hobby}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHobby(hobby)}
                      className="remove-hobby-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              <FiSave /> {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;