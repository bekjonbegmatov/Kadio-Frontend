import React, { useState, useRef } from 'react'
import './MessageInput.css'

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const handleInputChange = (e) => {
    const value = e.target.value
    setMessage(value)
    
    // Автоматически изменяем высоту textarea
    adjustTextareaHeight()
    
    // Обработка индикатора печати
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      onTyping?.()
    }
    
    // Сбрасываем таймер печати
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Если пользователь перестал печатать на 1 секунду
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      setIsTyping(false)
      
      // Сбрасываем высоту textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
      // Очищаем таймер печати
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji)
    textareaRef.current?.focus()
    setTimeout(adjustTextareaHeight, 0)
    setShowEmojiPicker(false)
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥']

  return (
    <div className="message-input-container">
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-grid">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-btn"
                onClick={() => handleEmojiClick(emoji)}
                disabled={disabled}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="message-input">
        <div className="input-wrapper">
          <button
            onClick={toggleEmojiPicker}
            disabled={disabled}
            className="emoji-toggle-btn"
            type="button"
            title="Стикеры"
          >
            😊
          </button>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Подключение...' : 'Введите сообщение...'}
            disabled={disabled}
            rows={1}
            className="message-textarea"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled}
            className="send-btn"
            type="button"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        
        {disabled && (
          <div className="connection-warning">
            Подключение к чату...
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageInput