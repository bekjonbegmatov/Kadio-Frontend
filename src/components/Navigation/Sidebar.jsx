import React, { useState } from 'react';
import { 
  FiUser, FiUsers, FiFileText, FiMessageCircle, FiTrendingUp,
  FiAward, FiTarget, FiStar, FiEdit3, FiImage, FiBook, 
  FiBriefcase, FiShield, FiBarChart, FiMap, FiRss 
} from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { IoTrophyOutline } from 'react-icons/io5';
import { useProfile } from '../../store/ProfileContext';

import { Link } from 'react-router-dom';

import './Sidebar.css';

const Sidebar = ({ width = 380, isCollapsed = false, onToggle }) => {
  const [activeItem, setActiveItem] = useState('news');
  const { profile, loading } = useProfile();

  const socialItems = [
    { id: 'feed', name: 'Лента', icon: FiRss, badge: null, link: '/feed' },
    { id: 'friends', name: 'Друзья', icon: FiUsers, badge: null, link: '/friends' },
    { id: 'chats', name: 'Чаты', icon: FiMessageCircle, badge: null, link: '/chats' },
    { id: 'groups', name: 'Группы', icon: HiUserGroup, badge: null, link: '/groups' }
  ];

  const educationItems = [
    { id: 'courses', name: 'Курсы', icon: FiBook, badge: null, link: '/courses' }
  ];

  const gameItems = [
    { id: 'challenges', name: 'Челленджи', icon: FiTarget, badge: null, link: '/challenges' },
    { id: 'leaderboard', name: 'Leaderboard', icon: IoTrophyOutline, badge: null, link: '/leaderboard' },
    { id: 'contests', name: 'Конкурсы', icon: FiAward, badge: null, link: '/contests' }
  ];



  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    console.log('Clicked item:', itemId);
  };

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '60px' : `${width}px` }}
    >
      {/* Профиль пользователя */}
      <Link to="/profile" className="user-profile">
        <div className="avatar">
          {loading ? (
            <div className="avatar-placeholder">👤</div>
          ) : (
            <img 
              src={profile?.avatar_url && profile.avatar_url.trim() ? profile.avatar_url : null} 
              alt="Avatar" 
              onError={(e) => {
                e.target.src = null;
              }}
            />
          )}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <h4>{loading ? 'Загрузка...' : (profile?.email || 'Пользователь')}</h4>
            <p>{loading ? 'Загрузка...' : ('@' + (profile?.username || 'Пользователь'))}</p>
          </div>
        )}
      </Link>
      
      
      {/* Социальная секция */}
      <div className="sidebar-content">
        {!isCollapsed && (
          <div className="section-divider">
            <span className="section-label">Социальное</span>
          </div>
        )}
        
        {socialItems.map(item => (
          <Link 
            key={item.id}
            to={item.link}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="menu-icon"><item.icon /></span>
            {!isCollapsed && (
              <>
                <span className="menu-name">{item.name}</span>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </>
            )}
          </Link>
        ))}
        
        {/* Образовательная секция */}
        {!isCollapsed && (
          <div className="section-divider">
            <span className="section-label">Образование</span>
          </div>
        )}
        
        {educationItems.map(item => (
          <Link 
            key={item.id}
            to={item.link}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="menu-icon"><item.icon /></span>
            {!isCollapsed && (
              <>
                <span className="menu-name">{item.name}</span>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </>
            )}
          </Link>
        ))}
        
        {/* Игровая секция */}
        {!isCollapsed && (
          <div className="section-divider">
            <span className="section-label">Игры и Конкурсы</span>
          </div>
        )}
        
        {gameItems.map(item => (
          <Link 
            key={item.id}
            to={item.link}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="menu-icon"><item.icon /></span>
            {!isCollapsed && (
              <>
                <span className="menu-name">{item.name}</span>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;