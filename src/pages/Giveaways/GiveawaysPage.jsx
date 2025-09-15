import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGift, FiPlus, FiEye, FiEyeOff, FiUsers, FiClock, FiTrendingUp } from 'react-icons/fi';
import { getGiveaways } from '../../api/giveaways';
import animatedGift from '../../assets/gif/animaed_gift.gif';
import rIcon from '../../assets/img/navbar/R.png';
import './GiveawaysPage.css';

const GiveawaysPage = () => {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Показываем анимацию 2 секунды
    const animationTimer = setTimeout(() => {
      setShowAnimation(false);
      fetchGiveaways();
    }, 2000);

    return () => clearTimeout(animationTimer);
  }, []);

  const fetchGiveaways = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGiveaways();
      setGiveaways(data);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке конкурсов');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) {
      return { expired: true, text: 'Завершен' };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { expired: false, text: `${days}д ${hours}ч ${minutes}м` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}ч ${minutes}м` };
    } else {
      return { expired: false, text: `${minutes}м` };
    }
  };

  // Показываем анимацию подарка
  if (showAnimation) {
    return (
      <div className="giveaways-loading">
        <div className="gift-animation-container">
          <img 
            src={animatedGift} 
            alt="Загрузка конкурсов" 
            className="gift-animation"
          />
          <h2 className="loading-text">Загружаем конкурсы...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="giveaways-page">
      <div className="giveaways-header">
        <h1 className="page-title">
          <FiGift /> Конкурсы и Розыгрыши
        </h1>
        <p className="page-description">
          Участвуйте в конкурсах или создавайте свои собственные! 
          Выигрывайте алмазы и делитесь призами с сообществом.
        </p>
        <div className="header-actions">
          <Link to="/giveaways/create" className="create-giveaway-btn">
            <FiGift /> Создать конкурс
          </Link>
          <button 
            className="rules-toggle-btn"
            onClick={() => setShowRules(!showRules)}
          >
            {showRules ? <><FiEyeOff /> Скрыть правила</> : <><FiEye /> Показать правила</>}
          </button>
        </div>
      </div>

      {showRules && (
        <div className="rules-section">
          <h3><FiGift /> Правила конкурсов</h3>
          <div className="rules-grid">
            <div className="rule-item">
              <span className="rule-icon"><FiTrendingUp /></span>
              <div>
                <h4>Честная игра</h4>
                <p>Все конкурсы проводятся честно и прозрачно</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon"><FiClock /></span>
              <div>
                <h4>Соблюдение сроков</h4>
                <p>Результаты объявляются в указанное время</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon"><FiGift /></span>
              <div>
                <h4>Гарантия призов</h4>
                <p>Все призы гарантированно выдаются победителям</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon"><FiUsers /></span>
              <div>
                <h4>Равные возможности</h4>
                <p>У каждого участника равные шансы на победу</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка конкурсов...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchGiveaways} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="giveaways-grid">
          {giveaways.length === 0 ? (
            <div className="no-giveaways">
              <div className="empty-state">
                <span className="empty-icon"><FiGift /></span>
                <h3>Пока нет активных конкурсов</h3>
                <p>Станьте первым, кто создаст конкурс!</p>
                <Link to="/giveaways/create" className="create-first-btn">
                  Создать первый конкурс
                </Link>
              </div>
            </div>
          ) : (
            giveaways.map((giveaway) => {
              const timeLeft = getTimeLeft(giveaway.end_date);
              return (
                <div key={giveaway.id} className="giveaway-card">
                  <div className="card-header">
                    <h3 className="giveaway-title">{giveaway.title}</h3>
                    <span className={`status-badge ${giveaway.is_active ? 'active' : 'inactive'}`}>
                      {giveaway.is_active ? '🟢 Активен' : '🔴 Завершен'}
                    </span>
                  </div>
                  
                  <p className="giveaway-description">{giveaway.description}</p>
                  
                  <div className="giveaway-stats">
                    <div className="stat">
                      <span className="stat-label">Призовой фонд:</span>
                      <span className="stat-value prize-fond"><img src={rIcon} alt="R" className="r-icon" /> {giveaway.prize_fond}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Взнос:</span>
                      <span className="stat-value"><img src={rIcon} alt="R" className="r-icon" /> {giveaway.giveaway_cost}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Участников:</span>
                      <span className="stat-value">{giveaway.participants_count}</span>
                    </div>
                  </div>
                  
                  <div className="giveaway-timing">
                    <div className="time-info">
                      <span className="time-label">Окончание:</span>
                      <span className="time-value">{formatDate(giveaway.end_date)}</span>
                    </div>
                    <div className="time-left">
                      <span className={`countdown ${timeLeft.expired ? 'expired' : ''}`}>
                        {timeLeft.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="organizer">Организатор: {giveaway.organizator_email}</span>
                    <Link 
                      to={`/giveaways/${giveaway.id}`} 
                      className="view-details-btn"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default GiveawaysPage;