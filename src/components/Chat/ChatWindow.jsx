import React, { useState, useEffect, useRef } from 'react'
import { getChatMessages, markMessagesAsRead, ChatWebSocket } from '../../api/chat'
import MessageInput from './MessageInput'
import './ChatWindow.css'

import { BASE_URL } from '../../api/config'

const ChatWindow = ({ room, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [wsConnected, setWsConnected] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const wsRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (room) {
      // Сбрасываем состояние при смене комнаты
      setMessages([])
      setCurrentPage(1)
      setHasMoreMessages(true)
      setLoadingMore(false)
      isInitialLoad.current = true
      
      loadMessages(1)
      connectWebSocket()
      markAsRead()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [room?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true)
        isInitialLoad.current = true
      } else {
        setLoadingMore(true)
      }
      
      const data = await getChatMessages(room.id, page)
      
      if (append) {
        // Добавляем старые сообщения в начало списка
        setMessages(prev => [...data.messages, ...prev])
      } else {
        // Первая загрузка - заменяем все сообщения
        setMessages(data.messages)
      }
      
      // Проверяем есть ли еще сообщения
      setHasMoreMessages(data.messages.length === data.page_size)
      setCurrentPage(page)
      setError(null)
    } catch (err) {
      setError('Ошибка загрузки сообщений')
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.disconnect()
    }

    setWsConnected(false)
    setError(null)

    wsRef.current = new ChatWebSocket(
      room.id,
      handleNewMessage,
      handleTyping,
      handleWebSocketError
    )

    // Добавляем обработчик успешного подключения
    const originalConnect = wsRef.current.connect.bind(wsRef.current)
    wsRef.current.connect = () => {
      originalConnect()
      // Устанавливаем connected в true только после успешного onopen
      if (wsRef.current.ws) {
        wsRef.current.ws.addEventListener('open', () => {
          setWsConnected(true)
          setError(null)
        })
      }
    }

    wsRef.current.connect()
  }

  const handleNewMessage = (data) => {
    const newMessage = {
      id: data.message_id,
      content: data.message,
      sender: {
        id: data.sender_id,
        username: data.sender_username
      },
      timestamp: data.timestamp,
      is_read: false
    }

    setMessages(prev => {
      // Проверяем, нет ли уже такого сообщения
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev
      }
      return [...prev, newMessage]
    })

    // Если сообщение не от текущего пользователя, отмечаем как прочитанное и воспроизводим звук
    if (data.sender_id !== currentUser?.id) {
      // Воспроизводим звук уведомления
      try {
        const audio = new Audio('/src/assets/new-notification.mp3')
        audio.volume = 0.4 // Устанавливаем громкость на 50%
        audio.play().catch(error => {
          console.log('Не удалось воспроизвести звук уведомления:', error)
        })
      } catch (error) {
        console.log('Ошибка при создании аудио объекта:', error)
      }
      
      setTimeout(() => markAsRead(), 1000)
    }
  }

  const handleTyping = (data) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev)
      if (data.is_typing) {
        newSet.add(data.username)
      } else {
        newSet.delete(data.username)
      }
      return newSet
    })

    // Автоматически убираем индикатор печати через 3 секунды
    if (data.is_typing) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.username)
          return newSet
        })
      }, 3000)
    }
  }

  const handleWebSocketError = (error) => {
    console.error('WebSocket error:', error)
    setWsConnected(false)
    setError(`Ошибка подключения: ${error}`)
  }

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(room.id)
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  const handleSendMessage = (content) => {
    if (wsRef.current && wsConnected) {
      wsRef.current.sendMessage(content)
    }
  }

  const handleTypingStart = () => {
    if (wsRef.current && wsConnected) {
      wsRef.current.sendTyping(true)
      
      // Отправляем "перестал печатать" через 2 секунды бездействия
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsConnected) {
          wsRef.current.sendTyping(false)
        }
      }, 2000)
    }
  }

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMore) return
    
    const nextPage = currentPage + 1
    const scrollHeight = messagesContainerRef.current?.scrollHeight
    
    await loadMessages(nextPage, true)
    
    // Сохраняем позицию прокрутки после загрузки новых сообщений
    if (messagesContainerRef.current && scrollHeight) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      messagesContainerRef.current.scrollTop = newScrollHeight - scrollHeight
    }
  }

  const handleScroll = (e) => {
    const { scrollTop } = e.target
    
    // Если прокрутили в самый верх, загружаем старые сообщения
    if (scrollTop === 0 && hasMoreMessages && !loadingMore) {
      loadMoreMessages()
    }
  }

  const scrollToBottom = () => {
    if (isInitialLoad.current) {
      // При первой загрузке прокручиваем сразу без анимации
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      isInitialLoad.current = false
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    }
  }

  const groupMessagesByDate = (messages) => {
    const groups = []
    let currentDate = null
    let currentGroup = []

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString()
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup })
        }
        currentDate = messageDate
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup })
    }

    return groups
  }

  if (!room) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <div className="no-chat-content">
            <h3>Выберите чат</h3>
            <p>Выберите чат из списка или начните новый разговор с другом</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar">
              {room.other_user.avatar ? (
                <img src={BASE_URL + room.other_user.avatar} alt={room.other_user.username} />
              ) : (
                <div className="default-avatar">
                  {room.other_user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="chat-user-details">
              <h3>
                {room.other_user.first_name && room.other_user.last_name
                  ? `${room.other_user.first_name} ${room.other_user.last_name}`
                  : room.other_user.username
                }
              </h3>
              <span className={`status ${room.other_user.is_online ? 'online' : 'offline'}`}>
                {room.other_user.is_online ? 'В сети' : 'Не в сети'}
              </span>
            </div>
          </div>
        </div>
        <div className="loading-messages">Загрузка сообщений...</div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="chat-window">
      <div className="chat-header fixed-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            {room.other_user.avatar ? (
              <img src={ BASE_URL + room.other_user.avatar} alt={room.other_user.username} />
            ) : (
              <div className="default-avatar">
                {room.other_user.username.charAt(0).toUpperCase()}
              </div>
            )}
            {room.other_user.is_online && (
              <div className="online-indicator"></div>
            )}
          </div>
          <div className="chat-user-details">
            <h3>
              {room.other_user.first_name && room.other_user.last_name
                ? `${room.other_user.first_name} ${room.other_user.last_name}`
                : room.other_user.username
              }
            </h3>
            <div className="status-container">
              <span className={`status ${room.other_user.is_online ? 'online' : 'offline'}`}>
                {room.other_user.is_online ? 'В сети' : 'Не в сети'}
              </span>
              <span className={`ws-status ${wsConnected ? 'connected' : 'disconnected'}`}>
                {wsConnected ? '🟢' : '🔴'} {wsConnected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="connection-status">
          <div className={`ws-indicator ${wsConnected ? 'connected' : 'disconnected'}`}>
            {wsConnected ? '●' : '○'}
          </div>
        </div>
      </div>
      
      {!wsConnected && (
        <div className="connection-warning">
          ⚠️ Проблемы с подключением. Сообщения могут не отправляться.
        </div>
      )}

      <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => loadMessages(1)} className="retry-btn">
              Повторить
            </button>
          </div>
        )}
        
        {loadingMore && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <span>Загрузка старых сообщений...</span>
          </div>
        )}
        
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="date-separator">
              <span>{formatMessageDate(group.messages[0].timestamp)}</span>
            </div>
            
            {group.messages.map((message) => {
              const isOwnMessage = message.sender.id === currentUser?.id
              console.log('Message:', message, 'Current user:', currentUser, 'Is own:', isOwnMessage)
              
              return (
                <div
                  key={message.id}
                  className={`message ${isOwnMessage ? 'own' : 'other'}`}
                >
                  {!isOwnMessage && (
                    <div className="message-avatar">
                      {message.sender.avatar ? (
                        <img 
                          src={ BASE_URL + message.sender.avatar} 
                          alt={message.sender.username}
                        />
                      ) : (
                        <div className="default-avatar">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      <p className="message-text">{message.content}</p>
                      <span className="message-time">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  {isOwnMessage && (
                    <div className="message-avatar">
                      {currentUser?.avatar ? (
                        <img 
                          src={ BASE_URL + currentUser.avatar} 
                          alt={currentUser.username}
                        />
                      ) : (
                        <div className="default-avatar">
                          {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <div className="typing-content">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">
                {Array.from(typingUsers).join(', ')} печатает...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTypingStart}
        disabled={!wsConnected}
      />
    </div>
  )
}

export default ChatWindow