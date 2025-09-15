import { API_BASE_URL } from './config';

// Получить токен из localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Базовые заголовки для запросов
const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};

// Заголовки для FormData (файлы)
const getFormDataHeaders = () => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};

// Получить список постов
export const getPosts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  const url = `${API_BASE_URL}/feed/posts/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при загрузке постов');
  }
  
  return response.json();
};

// Получить конкретный пост
export const getPost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при загрузке поста');
  }
  
  return response.json();
};

// Создать новый пост
export const createPost = async (postData) => {
  // Если postData уже FormData, используем её напрямую
  let formData;
  if (postData instanceof FormData) {
    formData = postData;
  } else {
    // Иначе создаем новую FormData из объекта
    formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    
    if (postData.image) {
      formData.append('image', postData.image);
    }
    
    if (postData.tags && postData.tags.length > 0) {
      formData.append('tags', JSON.stringify(postData.tags));
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/feed/posts/`, {
    method: 'POST',
    headers: getFormDataHeaders(),
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Ошибка при создании поста');
  }
  
  return response.json();
};

// Обновить пост
export const updatePost = async (postId, postData) => {
  const formData = new FormData();
  
  if (postData.title) formData.append('title', postData.title);
  if (postData.content) formData.append('content', postData.content);
  if (postData.image) formData.append('image', postData.image);
  if (postData.tags) formData.append('tags', JSON.stringify(postData.tags));
  
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/`, {
    method: 'PATCH',
    headers: getFormDataHeaders(),
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при обновлении поста');
  }
  
  return response.json();
};

// Удалить пост
export const deletePost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении поста');
  }
};

// Поставить/убрать лайк
export const toggleLike = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/like/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при изменении лайка');
  }
  
  return response.json();
};

// Получить комментарии к посту
export const getComments = async (postId, params = {}) => {
  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}/feed/posts/${postId}/comments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при загрузке комментариев');
  }
  
  return response.json();
};

// Добавить комментарий
export const createComment = async (postId, commentData) => {
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/comments/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(commentData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Ошибка при создании комментария');
  }
  
  return response.json();
};

// Обновить комментарий
export const updateComment = async (commentId, commentData) => {
  const response = await fetch(`${API_BASE_URL}/feed/comments/${commentId}/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(commentData),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при обновлении комментария');
  }
  
  return response.json();
};

// Удалить комментарий
export const deleteComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/feed/comments/${commentId}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении комментария');
  }
};

// Поиск постов
export const searchPosts = async (searchParams) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key] !== undefined && searchParams[key] !== null) {
      if (Array.isArray(searchParams[key])) {
        searchParams[key].forEach(value => {
          queryParams.append(key, value);
        });
      } else {
        queryParams.append(key, searchParams[key]);
      }
    }
  });
  
  const response = await fetch(`${API_BASE_URL}/feed/search/?${queryParams.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при поиске постов');
  }
  
  return response.json();
};

// Получить рекомендации
export const getRecommendations = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}/feed/recommendations/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при загрузке рекомендаций');
  }
  
  return response.json();
};

// Получить посты пользователя
export const getUserPosts = async (userId = null, params = {}) => {
  const queryParams = new URLSearchParams(params);
  let url;
  
  if (userId) {
    url = `${API_BASE_URL}/feed/users/${userId}/posts/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  } else {
    url = `${API_BASE_URL}/feed/my-posts/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при загрузке постов пользователя');
  }
  
  return response.json();
};