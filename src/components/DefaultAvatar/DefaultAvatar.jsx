import React from 'react';
import './DefaultAvatar.css';

const DefaultAvatar = ({ user, email, name, size = 40 }) => {
  // Поддерживаем два способа передачи данных: через объект user или отдельные props
  const userData = user || { email, username: name, full_name: name };
  
  // Генерируем уникальный цвет на основе email или ID
  const generateColor = (input) => {
    let hash = 0;
    const str = input || 'default';
    
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Генерируем HSL цвет для лучшего контраста
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  // Получаем первую букву из email или username
  const getInitial = () => {
    if (userData.email) {
      return userData.email.charAt(0).toUpperCase();
    }
    if (userData.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    if (userData.full_name) {
      return userData.full_name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const backgroundColor = generateColor(userData.email || userData.username || userData.full_name || userData.id?.toString());
  const initial = getInitial();

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor,
    fontSize: `${size * 0.4}px`
  };

  return (
    <div className="default-avatar" style={style}>
      {initial}
    </div>
  );
};

export default DefaultAvatar;