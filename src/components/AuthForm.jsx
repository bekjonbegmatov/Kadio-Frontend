import React, { useState } from 'react';
import { registerUser, loginUser } from '../api/auth';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      if (isLogin) {
        result = await loginUser({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await registerUser({
          email: formData.email,
          password: formData.password,
          username: formData.username
        });
      }

      if (result.success) {
        setMessage(`${isLogin ? 'Вход' : 'Регистрация'} успешно выполнен!`);
        console.log('Response data:', result.data);
        
        // Очистка формы
        setFormData({ email: '', password: '', username: '' });
      } else {
        setMessage(`Ошибка: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      setMessage(`Произошла ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setFormData({ email: '', password: '', username: '' });
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Имя пользователя:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Введите имя пользователя"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Введите email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Введите пароль"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        <div className="toggle-mode">
          <p>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
        
        {message && (
          <div className={`message ${message.includes('успешно') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;