import React from 'react';
import './UserAvatar.css';

import { BASE_URL } from '../../api/config';

// Функция для генерации хэша из строки
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное целое число
  }
  return Math.abs(hash);
};

// Функция для генерации цвета на основе хэша
const generateColor = (username) => {
  const hash = hashCode(username || 'User');
  const colors = [
    '#4f46e5', '#7c3aed', '#dc2626', '#ea580c',
    '#d97706', '#ca8a04', '#65a30d', '#16a34a',
    '#059669', '#0891b2', '#0284c7', '#2563eb',
    '#4338ca', '#7c2d12', '#be185d', '#be123c'
  ];
  return colors[hash % colors.length];
};

// Функция для получения инициалов
const getInitials = (username) => {
  if (!username) return 'U';
  
  const words = username.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const UserAvatar = ({ 
  user, 
  size = 48, 
  className = '', 
  showOnlineStatus = false 
}) => {
  // Если есть аватар пользователя, показываем его
  if (user?.avatar) {
    return (
      <div className={`user-avatar-container ${className}`} style={{ width: size, height: size }}>
        <img 
          src={BASE_URL + user.avatar} 
          alt={user.username || 'User'}
          className="user-avatar-image"
          style={{ width: size, height: size }}
          onError={(e) => {
            // Если изображение не загрузилось, скрываем его и показываем инициалы
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className="user-avatar-fallback"
          style={{
            width: size,
            height: size,
            backgroundColor: generateColor(user?.username),
            fontSize: size * 0.4,
            display: 'none'
          }}
        >
          {getInitials(user?.username)}
        </div>
        {showOnlineStatus && (
          <div className="online-status" />
        )}
      </div>
    );
  }

  // Если нет аватара, показываем инициалы с цветом на основе хэша
  return (
    <div className={`user-avatar-container ${className}`} style={{ width: size, height: size }}>
      <div 
        className="user-avatar-fallback"
        style={{
          width: size,
          height: size,
          backgroundColor: generateColor(user?.username),
          fontSize: size * 0.4
        }}
      >
        {getInitials(user?.username)}
      </div>
      {showOnlineStatus && (
        <div className="online-status" />
      )}
    </div>
  );
};

export default UserAvatar;