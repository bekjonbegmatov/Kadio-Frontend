import React, { useState, useEffect } from 'react'
import { getChatRooms, getChatRoom } from '../../api/chat'
import { getUserFriends } from '../../api/friends'
import './ChatRoomList.css'

import { BASE_URL } from '../../api/config'

const ChatRoomList = ({ onSelectRoom, selectedRoomId }) => {
  const [rooms, setRooms] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creatingChat, setCreatingChat] = useState(null)

  useEffect(() => {
    loadChatRooms()
    loadFriends()
  }, [])

  const loadChatRooms = async () => {
    try {
      setLoading(true)
      const data = await getChatRooms()
      setRooms(data)
      setError(null)
    } catch (err) {
      setError('Ошибка загрузки чатов')
      console.error('Error loading chat rooms:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFriends = async () => {
    try {
      const result = await getUserFriends()
      console.log('Friends API result:', result)
      if (result.success) {
        const friendsData = result.data || []
        console.log('All friendships:', friendsData)
        const acceptedFriends = friendsData.filter(
          friendship => friendship.status === 'accepted'
        )
        console.log('Accepted friendships:', acceptedFriends)
        const friendsList = acceptedFriends.map(friendship => {
          // Получаем текущего пользователя из localStorage или другого источника
          const currentUserId = JSON.parse(localStorage.getItem('user'))?.id
          console.log('Current user ID:', currentUserId)
          console.log('Friendship:', friendship)
          
          // Определяем друга: если from_user это текущий пользователь, то друг - to_user, иначе from_user
          const friend = friendship.from_user.id === currentUserId 
            ? friendship.to_user 
            : friendship.from_user
          console.log('Friend:', friend)
          return friend
        })
        console.log('Final friends list:', friendsList)
        setFriends(friendsList)
      }
    } catch (err) {
      console.error('Error loading friends:', err)
    }
  }

  const handleStartChat = async (friend) => {
    try {
      setCreatingChat(friend.id)
      const roomData = await getChatRoom(friend.id)
      // Обновляем список чатов после создания нового
      await loadChatRooms()
      // Находим созданную комнату в обновленном списке
      const updatedRooms = await getChatRooms()
      const newRoom = updatedRooms.find(room => room.other_user.id === friend.id)
      if (newRoom) {
        onSelectRoom(newRoom)
      }
    } catch (err) {
      console.error('Error creating chat:', err)
      setError('Ошибка создания чата')
    } finally {
      setCreatingChat(null)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  if (loading) {
    return (
      <div className="chat-room-list">
        <div className="chat-room-list-header">
          <h3>Чаты</h3>
        </div>
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-room-list">
        <div className="chat-room-list-header">
          <h3>Чаты</h3>
        </div>
        <div className="error">
          {error}
          <button onClick={loadChatRooms} className="retry-btn">
            Повторить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-room-list">
      <div className="chat-room-list-header">
        <h3>Чаты</h3>
        <button onClick={loadChatRooms} className="refresh-btn">
          ↻
        </button>
      </div>
      
      <div className="chat-rooms">
        {rooms.length === 0 ? (
          <div className="no-chats">
            <div className="no-chats-message">
              <p>У вас пока нет чатов</p>
              <p>Начните общение с друзьями!</p>
            </div>
            
            {friends.length > 0 && (
              <div className="friends-list">
                <h4>Ваши друзья:</h4>
                <div className="friends-grid">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`friend-item ${
                        creatingChat === friend.id ? 'creating' : ''
                      }`}
                      onClick={() => handleStartChat(friend)}
                    >
                      <div className="friend-avatar">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.username} />
                        ) : (
                          <div className="default-avatar">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {friend.is_online && (
                          <div className="online-indicator"></div>
                        )}
                      </div>
                      <div className="friend-info">
                        <span className="friend-name">
                          {friend.first_name && friend.last_name
                            ? `${friend.first_name} ${friend.last_name}`
                            : friend.username
                          }
                        </span>
                        <span className="friend-status">
                          {creatingChat === friend.id
                            ? 'Создание чата...'
                            : friend.is_online
                            ? 'В сети'
                            : 'Не в сети'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className={`chat-room-item ${
                selectedRoomId === room.id ? 'active' : ''
              }`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="room-avatar">
                {room.other_user.avatar ? (
                  <img 
                    src={ BASE_URL + room.other_user.avatar} 
                    alt={room.other_user.username}
                  />
                ) : (
                  <div className="default-avatar">
                    {room.other_user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {room.other_user.is_online && (
                  <div className="online-indicator"></div>
                )}
              </div>
              
              <div className="room-info">
                <div className="room-header">
                  <h4 className="room-name">
                    {room.other_user.first_name && room.other_user.last_name
                      ? `${room.other_user.first_name} ${room.other_user.last_name}`
                      : room.other_user.username
                    }
                  </h4>
                  {room.last_message && (
                    <span className="last-message-time">
                      {formatTime(room.last_message.timestamp)}
                    </span>
                  )}
                </div>
                
                <div className="room-preview">
                  {room.last_message ? (
                    <p className="last-message">
                      {room.last_message.sender_id === room.other_user.id
                        ? room.last_message.content
                        : `Вы: ${room.last_message.content}`
                      }
                    </p>
                  ) : (
                    <p className="no-messages">Нет сообщений</p>
                  )}
                  
                  {room.unread_count > 0 && (
                    <div className="unread-badge">
                      {room.unread_count > 99 ? '99+' : room.unread_count}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatRoomList