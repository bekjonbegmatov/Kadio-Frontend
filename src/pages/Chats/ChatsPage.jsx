import React, { useState, useEffect } from 'react'
import Chat from '../../components/Chat/Chat'
import './ChatsPage.css'

const ChatsPage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Симуляция получения данных текущего пользователя
    // В реальном приложении здесь будет запрос к API или получение из контекста/store
    const loadCurrentUser = async () => {
      try {
        setLoading(true)
        
        // Временные данные пользователя для демонстрации
        // В реальном приложении замените на реальный API вызов
        const userData = {
          id: 1,
          username: 'current_user',
          first_name: 'Текущий',
          last_name: 'Пользователь',
          email: 'user@example.com',
          avatar: null
        }
        
        // Симуляция задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setCurrentUser(userData)
      } catch (err) {
        console.error('Ошибка загрузки пользователя:', err)
        setError('Не удалось загрузить данные пользователя')
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  const handleRetry = () => {
    setError(null)
    // Перезагрузка страницы или повторный вызов loadCurrentUser
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="chats-page">
        <div className="chats-loading">
          <div className="loading-spinner"></div>
          <h2>Загрузка чата...</h2>
          <p>Подготавливаем все для вашего общения</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chats-page">
        <div className="chats-error">
          <div className="error-icon">😞</div>
          <h2>Что-то пошло не так</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-btn">
              Попробовать снова
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="home-btn"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="chats-page">
        <div className="chats-error">
          <div className="error-icon">🔐</div>
          <h2>Требуется авторизация</h2>
          <p>Для использования чата необходимо войти в систему</p>
          <div className="error-actions">
            <button 
              onClick={() => window.location.href = '/login'} 
              className="login-btn"
            >
              Войти
            </button>
            <button 
              onClick={() => window.location.href = '/register'} 
              className="register-btn"
            >
              Регистрация
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chats-page">
      <Chat currentUser={currentUser} />
    </div>
  )
}

export default ChatsPage