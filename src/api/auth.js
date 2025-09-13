import axios from 'axios';

// Базовый URL для API
import { BASE_URL } from './config';

const API_BASE_URL = BASE_URL;
// Регистрация пользователя
export const registerUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('username', userData.username);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/auth/register/`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData
    };

    const response = await axios.request(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Вход пользователя
export const loginUser = async (credentials) => {
  try {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/auth/login/`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData
    };

    const response = await axios.request(config);
    
    // Сохраняем токен в localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        email: response.data.email
      }));
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Выход пользователя
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Получение токена
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Получение данных пользователя
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Проверка авторизации
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Получение профиля пользователя
export const getUserProfile = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/auth/profile/`,
      headers: {
        'Authorization': `Token ${token}`,
        'Cache-Control': 'no-cache'
      }
    };

    const response = await axios.request(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    // Если получили 401 ошибку, очищаем localStorage и перезагружаем страницу
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.reload();
      return {
        success: false,
        error: 'Unauthorized - redirecting to login'
      };
    }
    
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Загрузка аватара пользователя
export const uploadAvatar = async (file) => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Токен не найден' };
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/api/auth/profile/upload-avatar/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Ошибка загрузки аватара' };
    }
  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error);
    return { success: false, error: 'Произошла ошибка при загрузке аватара' };
  }
};

// Получение активности пользователя
export const getUserActivity = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/activitys/user/`,
      headers: {
        'Authorization': `Token ${token}`,
        'Cache-Control': 'no-cache'
      }
    };

    const response = await axios.request(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Activity fetch error:', error);
    
    // Если получили 401 ошибку, очищаем localStorage и перезагружаем страницу
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.reload();
      return {
        success: false,
        error: 'Unauthorized - redirecting to login'
      };
    }
    
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Пример использования:
// 
// Регистрация:
// Обновление профиля пользователя
export const updateProfile = async (profileData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Токен авторизации не найден');
    }

    const formData = new FormData();
    
    // Добавляем все поля профиля в FormData
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.full_name) formData.append('full_name', profileData.full_name);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.user_time_zone) formData.append('user_time_zone', profileData.user_time_zone);
    if (profileData.date_of_birth) formData.append('date_of_birth', profileData.date_of_birth);
    if (profileData.link) formData.append('link', profileData.link);
    if (profileData.interests) {
      formData.append('interests', JSON.stringify(profileData.interests));
    }

    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/api/auth/profile/update/`,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      data: formData
    };

    const response = await axios.request(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Примеры использования:
// Регистрация:
// const result = await registerUser({
//   email: 'behruz@begmatov.com',
//   password: '1976791155',
//   username: 'behruz'
// });
//
// Вход:
// const result = await loginUser({
//   email: 'dsfdf@fdsdf.com',
//   password: '1976791155'
// });
//
// Получение активности:
// const result = await getUserActivity();
//
// Обновление профиля:
// const result = await updateProfile({
//   username: 'newusername',
//   bio: 'New bio text',
//   interests: { hobby: ['React', 'JavaScript'] }
// });