import React, { useState } from 'react';
import { registerUser, loginUser } from '../../api/auth';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Валидация в реальном времени
    const newErrors = { ...errors };
    
    if (name === 'password') {
      if (value && !validatePassword(value)) {
        newErrors.password = 'Пароль должен содержать минимум 8 символов';
      } else {
        delete newErrors.password;
      }
    }
    
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        newErrors.email = 'Введите корректный email';
      } else {
        delete newErrors.email;
      }
    }
    
    if (name === 'username') {
      if (value && value.length < 3) {
        newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
      } else {
        delete newErrors.username;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация перед отправкой
    const newErrors = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (!isLogin && formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setMessage('');
    setErrors({});

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
        
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data));

        window.location.href = '/';
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
    setErrors({});
    setFormData({ email: '', password: '', username: '' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <div className="input-container">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className={formData.username ? 'has-value' : ''}
                />
                <label htmlFor="username" className="floating-label">Имя пользователя</label>
              </div>
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
          )}
          
          <div className="form-group">
            <div className="input-container">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={formData.email ? 'has-value' : ''}
              />
              <label htmlFor="email" className="floating-label">Email</label>
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <div className="input-container">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={formData.password ? 'has-value' : ''}
              />
              <label htmlFor="password" className="floating-label">Пароль</label>
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <button type="submit" disabled={loading || Object.keys(errors).length > 0} className="submit-btn">
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