import { API_BASE_URL } from './config.js'

// Получить список друзей для чата
export const getFriends = async () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No token found')
  }

  const response = await fetch(`${API_BASE_URL}/chat/friends/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch friends')
  }

  return response.json()
}

// Получить список чат-комнат
export const getChatRooms = async () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No token found')
  }

  const response = await fetch(`${API_BASE_URL}/chat/rooms/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch chat rooms')
  }

  return response.json()
}

// Получить или создать чат-комнату с другом
export const getChatRoom = async (friendId) => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No token found')
  }

  const response = await fetch(`${API_BASE_URL}/chat/rooms/friend/${friendId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get chat room')
  }

  return response.json()
}

// Получить сообщения чата
export const getChatMessages = async (roomId, page = 1, pageSize = 50) => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No token found')
  }
  const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages/?page=${page}&page_size=${pageSize}`, {
  // const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }

  return response.json()
}

// Отправить сообщение через REST API
export const sendMessage = async (roomId, content) => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No token found')
  }

  const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  return response.json()
}

// Отметить сообщения как прочитанные
export const markMessagesAsRead = async (roomId) => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No token found')
  }

  const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/mark-read/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to mark messages as read')
  }

  return response.json()
}

// WebSocket подключение
export class ChatWebSocket {
  constructor(roomId, onMessage, onTyping, onError) {
    this.roomId = roomId
    this.onMessage = onMessage
    this.onTyping = onTyping
    this.onError = onError
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    const token = localStorage.getItem('authToken')
    if (!token) {
      this.onError('No token found')
      return
    }

    const wsUrl = `ws://192.168.0.11:8000/ws/chat/${this.roomId}/?token=${token}`
    console.log('Attempting WebSocket connection to:', wsUrl)
    
    try {
      this.ws = new WebSocket(wsUrl)
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.onError('Failed to create WebSocket connection')
      return
    }

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'message') {
          this.onMessage(data)
        } else if (data.type === 'typing') {
          this.onTyping(data)
        } else if (data.error) {
          this.onError(data.error)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        reconnectAttempts: this.reconnectAttempts
      })
      
      // Коды закрытия, при которых не нужно переподключаться
      const noReconnectCodes = [1000, 1001, 3000, 4000, 4001, 4003, 4004]
      
      if (!noReconnectCodes.includes(event.code) && this.reconnectAttempts < 5) {
        this.reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000) // Экспоненциальная задержка, максимум 30 сек
        
        console.log(`Reconnecting in ${delay}ms... Attempt ${this.reconnectAttempts}/5`)
        
        setTimeout(() => {
          if (this.reconnectAttempts <= 5) { // Дополнительная проверка
            this.connect()
          }
        }, delay)
      } else if (this.reconnectAttempts >= 5) {
        console.error('Max reconnection attempts reached')
        this.onError('Connection lost. Please refresh the page.')
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error details:', {
        error,
        readyState: this.ws?.readyState,
        url: wsUrl,
        roomId: this.roomId
      })
      this.onError(`WebSocket connection error: ${error.type || 'Unknown error'}`)
    }
  }

  sendMessage(content) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        message: content
      }))
    }
  }

  sendTyping(isTyping) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}