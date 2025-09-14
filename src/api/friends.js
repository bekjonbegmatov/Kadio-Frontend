import { BASE_URL } from './config';

import axios from 'axios';

// Получение токена
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get all users 
export const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/users/all/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};


// Get user friends
export const getUserFriends = async () => {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/api/friends/`,
      headers: {
        'Authorization': `Token ${getAuthToken()}`,
      },
    };
    const response = await axios.request(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user friends:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Получить рекомендации друзей
export const getFriendRecommendations = async (limit = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/friends/recommendations/?limit=${limit}`, {
      headers: {
        'Authorization': `Token ${getAuthToken()}`,
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching friend recommendations:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Отправить запрос в друзья
export const sendFriendRequest = async (toUserId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/friends/add/`, {
      to_user: toUserId
    }, {
      headers: {
        'Authorization': `Token ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Получить запросы дружбы (входящие и исходящие)
export const getFriendRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/friends/requests/`, {
      headers: {
        'Authorization': `Token ${getAuthToken()}`,
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};
