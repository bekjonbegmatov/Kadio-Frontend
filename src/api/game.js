import { API_BASE_URL } from './config';

// Получить глобальный лидерборд
export const getGlobalLeaderboard = async (limit = 100) => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/leaderboard/global/?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Ошибка при получении глобального лидерборда:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить лидерборд среди друзей
export const getFriendsLeaderboard = async (limit = 100) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Токен авторизации не найден');
    }
    
    const response = await fetch(`${API_BASE_URL}/game/leaderboard/frends/?limit=${limit}`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Ошибка при получении лидерборда друзей:', error);
    return {
      success: false,
      error: error.message
    };
  }
};