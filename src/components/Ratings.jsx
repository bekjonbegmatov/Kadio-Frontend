import React from 'react';
import { FiAward, FiStar, FiTarget, FiZap, FiBarChart } from 'react-icons/fi';
import './Ratings.css';

const Ratings = () => {
  const achievements = [
    { icon: FiAward, title: 'Лучший Дизайнер', level: 'Золото', progress: 100 },
    { icon: FiStar, title: 'Звезда Команды', level: 'Серебро', progress: 85 },
    { icon: FiTarget, title: 'Точность', level: 'Бронза', progress: 65 },
    { icon: FiZap, title: 'Инноватор', level: 'Платина', progress: 45 }
  ];

  const ratings = [
    { category: 'Креативность', score: 95, color: '#667eea' },
    { category: 'Командная работа', score: 88, color: '#764ba2' },
    { category: 'Техническая экспертиза', score: 92, color: '#10b981' },
    { category: 'Лидерство', score: 78, color: '#f59e0b' },
    { category: 'Коммуникация', score: 85, color: '#ef4444' }
  ];

  return (
    <div className="ratings-container">
      {/* Рейтинг */}
      <div className="rating-card">
        <div className="card-header">
          <h3><FiBarChart className="header-icon" /> Рейтинг</h3>
          <div className="overall-score">
            <span className="score-number">4.8</span>
            <div className="stars">
              {'★★★★★'.split('').map((star, index) => (
                <span key={index} className={`star ${index < 5 ? 'filled' : ''}`}>
                  {star}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="rating-breakdown">
          {ratings.map((rating, index) => (
            <div key={index} className="rating-item">
              <div className="rating-info">
                <span className="rating-category">{rating.category}</span>
                <span className="rating-score">{rating.score}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${rating.score}%`, 
                    backgroundColor: rating.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Достижения */}
      <div className="achievements-card">
        <div className="card-header">
          <h3><FiAward className="header-icon" /> Достижения</h3>
          <span className="achievement-count">12 из 20</span>
        </div>
        
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className={`achievement-item ${achievement.progress === 100 ? 'completed' : ''}`}>
              <div className="achievement-icon"><achievement.icon /></div>
              <div className="achievement-info">
                <h4>{achievement.title}</h4>
                <span className={`level ${achievement.level.toLowerCase()}`}>{achievement.level}</span>
                <div className="achievement-progress">
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{achievement.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Последние достижения */}
      <div className="recent-achievements">
        <h4><FiZap className="header-icon" /> Последние достижения</h4>
        <div className="recent-list">
          <div className="recent-item">
            <div className="recent-icon"><FiAward /></div>
            <div className="recent-text">
              <span>Получено достижение "Лучший Дизайнер"</span>
              <small>2 дня назад</small>
            </div>
          </div>
          <div className="recent-item">
            <div className="recent-icon"><FiStar /></div>
            <div className="recent-text">
              <span>Повышение до уровня "Звезда Команды"</span>
              <small>1 неделя назад</small>
            </div>
          </div>
          <div className="recent-item">
            <div className="recent-icon"><FiTarget /></div>
            <div className="recent-text">
              <span>Разблокировано достижение "Точность"</span>
              <small>2 недели назад</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;