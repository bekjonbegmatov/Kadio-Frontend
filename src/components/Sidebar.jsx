import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiUsers, FiFileText, FiShoppingBag, FiCheckSquare, 
  FiAward, FiTarget, FiStar, FiEdit3, FiImage, FiBook, 
  FiBriefcase, FiShield, FiBarChart, FiMap 
} from 'react-icons/fi';
import { getUserProfile } from '../api/auth';
import './Sidebar.css';

const Sidebar = ({ width = 280, isCollapsed = false, onToggle }) => {
  const [activeItem, setActiveItem] = useState('news');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'news', name: 'Новости', icon: FiFileText, badge: null },
    { id: 'colleagues', name: 'Коллеги', icon: FiUsers, badge: null },
    { id: 'hero', name: 'Герой', icon: FiShield, badge: null },
    { id: 'achievements', name: 'Достижения', icon: FiAward, badge: null },
    { id: 'shop', name: 'Магазин', icon: FiShoppingBag, badge: null },
    { id: 'tasks', name: 'Задания', icon: FiCheckSquare, badge: null },
    { id: 'contests', name: 'Конкурсы', icon: FiTarget, badge: null },
    { id: 'quests', name: 'Квесты', icon: FiMap, badge: null },
    { id: 'ratings', name: 'Рейтинги', icon: FiBarChart, badge: null }
  ];

  const contentItems = [
    { id: 'applications', name: 'Заявки', icon: FiEdit3, badge: null },
    { id: 'gallery', name: 'Галерея', icon: FiImage, badge: null },
    { id: 'materials', name: 'Материалы', icon: FiBook, badge: null },
    { id: 'documents', name: 'Документы', icon: FiFileText, badge: null },
    { id: 'company', name: 'Компания', icon: FiBriefcase, badge: null }
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
      <div className="user-profile">
        <div className="avatar">
          {loading ? (
            <div className="avatar-placeholder">👤</div>
          ) : (
            <img 
              src={userProfile?.avatar || ''} 
              alt="Avatar" 
              onError={(e) => {
                e.target.src = '';
              }}
            />
          )}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <h4>{loading ? 'Загрузка...' : (userProfile?.name || 'Пользователь')}</h4>
          </div>
        )}
      </div>
      
      {/* Игровая секция */}
      {!isCollapsed && (
        <div className="game-section">
          <span className="section-label">Игра</span>
        </div>
      )}
      
      {/* Основное меню */}
      <div className="sidebar-content">
        {menuItems.map(item => (
          <div 
            key={item.id}
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
          </div>
        ))}
        
        {/* Контент секция */}
        {!isCollapsed && (
          <div className="section-divider">
            <span className="section-label">Контент</span>
          </div>
        )}
        
        {contentItems.map(item => (
          <div 
            key={item.id}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;