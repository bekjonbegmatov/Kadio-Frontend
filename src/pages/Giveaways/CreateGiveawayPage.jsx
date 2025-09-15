import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGift, FiAlertTriangle, FiBarChart } from 'react-icons/fi';
import { createGiveaway } from '../../api/giveaways';
import { isAuthenticated, getCurrentUser } from '../../api/auth';
import animatedGift from '../../assets/gif/animaed_gift.gif';
import rIcon from '../../assets/img/navbar/R.png';
import './CreateGiveawayPage.css';

const CreateGiveawayPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize_fond: '',
    end_date: '',
    giveaway_cost: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очистить ошибку при изменении поля
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Название конкурса обязательно');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Описание конкурса обязательно');
      return false;
    }
    if (!formData.prize_fond || formData.prize_fond <= 0) {
      setError('Призовой фонд должен быть больше 0');
      return false;
    }
    if (!formData.giveaway_cost || formData.giveaway_cost <= 0) {
      setError('Стоимость участия должна быть больше 0');
      return false;
    }
    if (!formData.end_date) {
      setError('Дата окончания обязательна');
      return false;
    }
    
    // Проверка что дата окончания в будущем
    const endDate = new Date(formData.end_date);
    const now = new Date();
    if (endDate <= now) {
      setError('Дата окончания должна быть в будущем');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Форматируем дату для API
      const formattedData = {
        ...formData,
        prize_fond: parseInt(formData.prize_fond),
        giveaway_cost: parseInt(formData.giveaway_cost),
        end_date: new Date(formData.end_date).toISOString(),
        start_date: new Date().toISOString()
      };

      const result = await createGiveaway(formattedData);
      
      // Перенаправляем на страницу созданного конкурса
      navigate(`/giveaways/${result.id}`);
    } catch (err) {
      console.error('Ошибка создания конкурса:', err);
      setError(err.message || 'Произошла ошибка при создании конкурса');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/giveaways');
  };

  // Минимальная дата - завтра
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="create-giveaway-page">
      <div className="create-giveaway-container">
        <div className="page-header">
          <h1 className="page-title"><FiGift /> Создать новый конкурс</h1>
          <p className="page-subtitle">
            Создайте увлекательный конкурс и дайте другим пользователям шанс выиграть призы!
          </p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="giveaway-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Название конкурса *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Например: Новогодний розыгрыш алмазов"
                maxLength={100}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Описание конкурса *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Расскажите участникам о вашем конкурсе..."
                rows={4}
                maxLength={500}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prize_fond" className="form-label">
                  Призовой фонд (алмазы) *
                </label>
                <input
                  type="number"
                  id="prize_fond"
                  name="prize_fond"
                  value={formData.prize_fond}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="100"
                  min="1"
                  disabled={loading}
                />
                <small className="form-hint">
                  Эта сумма будет списана с вашего счета
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="giveaway_cost" className="form-label">
                  Стоимость участия (алмазы) *
                </label>
                <input
                  type="number"
                  id="giveaway_cost"
                  name="giveaway_cost"
                  value={formData.giveaway_cost}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="10"
                  min="1"
                  disabled={loading}
                />
                <small className="form-hint">
                  Сколько должны заплатить участники
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="end_date" className="form-label">
                Дата и время окончания *
              </label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="form-input"
                min={minDate}
                disabled={loading}
              />
              <small className="form-hint">
                Конкурс автоматически завершится в указанное время
              </small>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon"><FiAlertTriangle /></span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Создание...
                  </>
                ) : (
                  <><FiGift /> Создать конкурс</>
                )}
              </button>
            </div>
          </form>

          <div className="info-sidebar">
            <div className="info-card">
              <h3><FiGift /> Как это работает?</h3>
              <ul>
                <li>Вы создаете конкурс и вносите призовой фонд</li>
                <li>Другие пользователи платят за участие</li>
                <li>В конце случайно выбирается победитель</li>
                <li>Победитель получает весь призовой фонд</li>
                <li>Если участников много - вы получаете прибыль</li>
              </ul>
            </div>

            <div className="info-card warning">
              <h3><FiAlertTriangle /> Важно знать</h3>
              <ul>
                <li>Вы не можете участвовать в своем конкурсе</li>
                <li>Призовой фонд списывается сразу</li>
                <li>Конкурс нельзя отменить после создания</li>
                <li>Победитель выбирается автоматически</li>
              </ul>
            </div>

            <div className="info-card example">
              <h3><FiBarChart /> Пример расчета</h3>
              <div className="example-calculation">
                <p><strong>Призовой фонд:</strong> 100 алмазов</p>
                <p><strong>Стоимость участия:</strong> 10 алмазов</p>
                <hr />
                <p><strong>5 участников:</strong> 50 алмазов собрано</p>
                <p><strong>Победитель получает:</strong> 100 алмазов</p>
                <p><strong>Ваш убыток:</strong> -50 алмазов</p>
                <hr />
                <p><strong>15 участников:</strong> 150 алмазов собрано</p>
                <p><strong>Победитель получает:</strong> 100 алмазов</p>
                <p><strong>Ваша прибыль:</strong> +50 алмазов</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGiveawayPage;