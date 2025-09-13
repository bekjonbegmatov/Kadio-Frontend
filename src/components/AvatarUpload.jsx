import React, { useState, useRef } from 'react';
import { uploadAvatar } from '../api/auth';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        setSuccess('Аватар успешно обновлен!');
        if (onAvatarUpdate) {
          onAvatarUpdate(result.data.avatar_url || result.data.url);
        }
        // Очистить сообщение об успехе через 3 секунды
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке файла');
    } finally {
      setUploading(false);
      // Очистить input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="avatar-upload-container">
      <div className="avatar-preview">
        <img 
          src={currentAvatar || ''} 
          alt="Avatar preview"
          className="avatar-image"
          onError={(e) => {
            e.target.src = '';
          }}
        />
        <div className="avatar-overlay" onClick={triggerFileInput}>
          <span className="upload-icon">📷</span>
          <span className="upload-text">Изменить</span>
        </div>
      </div>

      <div 
        className={`drop-zone ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="file-input"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <span>Загрузка...</span>
          </div>
        ) : (
          <div className="drop-zone-content">
            <span className="upload-icon-large">📁</span>
            <p className="drop-text">Перетащите изображение сюда или нажмите для выбора</p>
            <p className="file-info">Поддерживаются: JPEG, PNG, GIF, WebP (макс. 5МБ)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="message error-message">
          <span className="message-icon">❌</span>
          {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          <span className="message-icon">✅</span>
          {success}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;