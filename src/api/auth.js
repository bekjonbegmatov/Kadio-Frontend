import axios from 'axios';

// Базовый URL для API
const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

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
      url: `${API_BASE_URL}/register/`,
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
      url: `${API_BASE_URL}/login/`,
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
      url: `${API_BASE_URL}/profile/`,
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
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Загрузка аватара пользователя
export const uploadAvatar = async (avatarFile) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Проверка размера файла (максимум 5МБ)
    const maxSize = 5 * 1024 * 1024; // 5MB в байтах
    if (avatarFile.size > maxSize) {
      throw new Error('Размер файла не должен превышать 5МБ');
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.type)) {
      throw new Error('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${API_BASE_URL}/profile/upload-avatar/`,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    };

    const response = await axios.request(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      error: error.message || error.response?.data || 'Ошибка загрузки аватара'
    };
  }
};

// Пример использования:
// 
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