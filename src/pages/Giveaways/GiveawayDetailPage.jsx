import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiUsers, FiDollarSign, FiTarget, FiAlertTriangle, FiGift } from 'react-icons/fi';
import { getGiveawayById, participateInGiveaway } from '../../api/giveaways';
import { isAuthenticated, getCurrentUser } from '../../api/auth';
import animatedGift from '../../assets/gif/animaed_gift.gif';
import rIcon from '../../assets/img/navbar/R.png';
import './GiveawayDetailPage.css';

const GiveawayDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [giveaway, setGiveaway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    loadGiveaway();
  }, [id]);

  useEffect(() => {
    if (giveaway && giveaway.is_active) {
      const timer = setInterval(() => {
        updateTimeLeft();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [giveaway]);

  const loadGiveaway = async () => {
    try {
      setLoading(true);
      const data = await getGiveawayById(id);
      setGiveaway(data);
      updateTimeLeft(data);
    } catch (err) {
      console.error('Ошибка загрузки конкурса:', err);
      setError('Конкурс не найден или произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeLeft = (giveawayData = giveaway) => {
    if (!giveawayData || !giveawayData.end_date) return;
    
    const endTime = new Date(giveawayData.end_date).getTime();
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}д ${hours}ч ${minutes}м ${seconds}с`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}м ${seconds}с`);
      } else {
        setTimeLeft(`${seconds}с`);
      }
    } else {
      setTimeLeft('Завершен');
    }
  };

  const handleParticipate = async () => {
    if (!giveaway || !giveaway.is_active) return;

    setParticipating(true);
    setError('');
    setSuccess('');

    try {
      const result = await participateInGiveaway(id);
      setSuccess(result.message || 'Вы успешно участвуете в конкурсе!');
      
      // Обновляем данные конкурса
      await loadGiveaway();
    } catch (err) {
      console.error('Ошибка участия в конкурсе:', err);
      setError(err.message || 'Произошла ошибка при участии в конкурсе');
    } finally {
      setParticipating(false);
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

  const calculatePotentialPrize = () => {
    if (!giveaway) return 0;
    return giveaway.prize_fond + (giveaway.participants_count * giveaway.giveaway_cost);
  };

  if (loading) {
    return (
      <div className="giveaway-detail-loading">
        <div className="loading-container">
          <img src={animatedGift} alt="Загрузка" className="loading-gift" />
          <p className="loading-text">Загружаем конкурс...</p>
        </div>
      </div>
    );
  }

  if (error && !giveaway) {
    return (
      <div className="giveaway-detail-error">
        <div className="error-container">
          <span className="error-icon">😞</span>
          <h2>Упс! Что-то пошло не так</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadGiveaway} className="btn btn-primary">
              Попробовать снова
            </button>
            <Link to="/giveaways" className="btn btn-secondary">
              Вернуться к конкурсам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="giveaway-detail-page">
      <div className="giveaway-detail-container">
        {/* Навигация */}
        <div className="breadcrumb">
          <Link to="/giveaways" className="breadcrumb-link">
            ← Все конкурсы
          </Link>
        </div>

        {/* Основная информация */}
        <div className="giveaway-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="giveaway-title">{giveaway.title}</h1>
              <div className="status-badges">
                <span className={`status-badge ${giveaway.is_active ? 'active' : 'inactive'}`}>
                  {giveaway.is_active ? '🟢 Активен' : '🔴 Завершен'}
                </span>
                {timeLeft && (
                  <span className={`time-badge ${timeLeft === 'Завершен' ? 'expired' : ''}`}>
                    <FiClock /> {timeLeft}
                  </span>
                )}
              </div>
            </div>
            <div className="prize-section">
              <div className="current-prize">
                <span className="prize-label">Текущий призовой фонд</span>
                <span className="prize-amount">{calculatePotentialPrize()} <img src={rIcon} alt="R" className="r-icon" /></span>
              </div>
            </div>
          </div>
        </div>

        <div className="giveaway-content">
          {/* Левая колонка - основная информация */}
          <div className="main-content">
            <div className="description-card">
              <h3>📝 Описание конкурса</h3>
              <p className="giveaway-description">{giveaway.description}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><FiUsers /></div>
                <div className="stat-content">
                  <span className="stat-value">{giveaway.participants_count}</span>
                  <span className="stat-label">Участников</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><FiDollarSign /></div>
                <div className="stat-content">
                  <span className="stat-value">{giveaway.prize_fond} <img src={rIcon} alt="R" className="r-icon" /></span>
                  <span className="stat-label">Базовый приз</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎫</div>
                <div className="stat-content">
                  <span className="stat-value">{giveaway.giveaway_cost} <img src={rIcon} alt="R" className="r-icon" /></span>
                  <span className="stat-label">Стоимость участия</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💵</div>
                <div className="stat-content">
                  <span className="stat-value">{giveaway.participants_count * giveaway.giveaway_cost} <img src={rIcon} alt="R" className="r-icon" /></span>
                  <span className="stat-label">Собрано от участников</span>
                </div>
              </div>
            </div>

            <div className="timeline-card">
              <h3><FiClock /> Временная линия</h3>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <strong>Начало конкурса</strong>
                    <p>{formatDate(giveaway.start_date)}</p>
                  </div>
                </div>
                <div className={`timeline-item ${!giveaway.is_active ? 'completed' : 'current'}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <strong>Окончание конкурса</strong>
                    <p>{formatDate(giveaway.end_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - действия и дополнительная информация */}
          <div className="sidebar-content">
            {/* Карточка участия */}
            <div className="participation-card">
              <h3><FiTarget /> Участие в конкурсе</h3>
              
              {success && (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  {success}
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <span className="error-icon"><FiAlertTriangle /></span>
                  {error}
                </div>
              )}
              
              {giveaway.is_active ? (
                <div className="participation-info">
                  <div className="cost-info">
                    <span className="cost-label">Стоимость участия:</span>
                    <span className="cost-value">{giveaway.giveaway_cost} <img src={rIcon} alt="R" className="r-icon" /></span>
                  </div>
                  <div className="prize-info">
                    <span className="prize-label">Возможный выигрыш:</span>
                    <span className="prize-value">{calculatePotentialPrize()} <img src={rIcon} alt="R" className="r-icon" /></span>
                  </div>
                  <button
                    onClick={handleParticipate}
                    disabled={participating}
                    className="participate-btn"
                  >
                    {participating ? (
                      <>
                        <span className="spinner"></span>
                        Участвуем...
                      </>
                    ) : (
                      <><FiGift /> Участвовать в конкурсе</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="inactive-info">
                  <p>Этот конкурс уже завершен</p>
                  <Link to="/giveaways" className="btn btn-secondary">
                    Посмотреть активные конкурсы
                  </Link>
                </div>
              )}
            </div>

            {/* Информация об организаторе */}
            <div className="organizer-card">
              <h3>👤 Организатор</h3>
              <div className="organizer-info">
                <div className="organizer-avatar">
                  {giveaway.organizator_email.charAt(0).toUpperCase()}
                </div>
                <div className="organizer-details">
                  <p className="organizer-email">{giveaway.organizator_email}</p>
                  <p className="organizer-label">Создатель конкурса</p>
                </div>
              </div>
            </div>

            {/* Правила */}
            <div className="rules-card">
              <h3>📋 Правила конкурса</h3>
              <ul className="rules-list">
                <li>Победитель выбирается случайным образом</li>
                <li>Создатель не может участвовать в своем конкурсе</li>
                <li>Призовой фонд увеличивается с каждым участником</li>
                <li>Результаты объявляются автоматически</li>
                <li>Возврат средств невозможен</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveawayDetailPage;