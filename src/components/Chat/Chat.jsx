import React, { useState, useEffect } from 'react'
import ChatRoomList from './ChatRoomList'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import { getFriends } from '../../api/chat'
import './Chat.css'

const Chat = ({ currentUser }) => {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showRoomList, setShowRoomList] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setShowRoomList(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      setLoading(true)
      setError(null)
      const friendsData = await getFriends()
      setFriends(friendsData)
    } catch (err) {
      console.error('Ошибка загрузки друзей:', err)
      setError('Не удалось загрузить список друзей')
    } finally {
      setLoading(false)
    }
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    if (isMobile) {
      setShowRoomList(false)
    }
  }

  const handleBackToRooms = () => {
    if (isMobile) {
      setShowRoomList(true)
      setSelectedRoom(null)
    }
  }

  const handleSendMessage = (message) => {
    // Эта функция будет передана в ChatWindow через MessageInput
    console.log('Отправка сообщения:', message)
  }

  const handleTyping = () => {
    // Обработка индикатора печати
    console.log('Пользователь печатает...')
  }

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка чата...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button onClick={loadFriends} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      {/* Мобильная навигация */}
      {isMobile && selectedRoom && (
        <div className="mobile-nav">
          <button onClick={handleBackToRooms} className="back-btn">
            ← Назад к чатам
          </button>
        </div>
      )}

      <div className="chat-layout">
        {/* Список чат-комнат */}
        <div className={`chat-sidebar ${
          isMobile ? (showRoomList ? 'show' : 'hide') : 'show'
        }`}>
          <ChatRoomList
            friends={friends}
            selectedRoomId={selectedRoom?.id}
            onSelectRoom={handleRoomSelect}
            currentUser={currentUser}
          />
        </div>

        {/* Основная область чата */}
        <div className={`chat-main ${
          isMobile ? (showRoomList ? 'hide' : 'show') : 'show'
        }`}>
          {selectedRoom ? (
            <div className="chat-window-container">
              <ChatWindow
                room={selectedRoom}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
              />
            </div>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Выберите чат</h3>
              <p>Выберите друга из списка, чтобы начать общение</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat