import { API_BASE_URL } from './config';

// Получить токен из localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Получить заголовки с авторизацией
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Token ${token}` : ''
  };
};

// Создать новый конкурс
export const createGiveaway = async (giveawayData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/giveaways/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(giveawayData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при создании конкурса');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка создания конкурса:', error);
    throw error;
  }
};

// Участвовать в конкурсе
export const participateInGiveaway = async (giveawayId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/giveaways/${giveawayId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при участии в конкурсе');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка участия в конкурсе:', error);
    throw error;
  }
};

// Получить все конкурсы (предполагаемый эндпоинт)
export const getGiveaways = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/giveaways/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении конкурсов');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения конкурсов:', error);
    throw error;
  }
};

// Получить конкурс по ID (предполагаемый эндпоинт)
export const getGiveawayById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/giveaways/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при получении конкурса');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения конкурса:', error);
    throw error;
  }
};