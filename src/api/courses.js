import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAuthToken } from './auth';

// Получение списка всех курсов
export const getCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/courses/`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count
    };
  } catch (error) {
    console.error('Get courses error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение детальной информации о курсе
export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/courses/${courseId}/`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get course by id error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение уроков курса
export const getCourseLessons = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/courses/${courseId}/lessons/`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count
    };
  } catch (error) {
    console.error('Get course lessons error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение комментариев к курсу
export const getCourseComments = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/courses/${courseId}/comments/`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count
    };
  } catch (error) {
    console.error('Get course comments error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Создание комментария к курсу
export const createCourseComment = async (courseId, content) => {
  try {
    if (!content || !content.trim()) {
      return {
        success: false,
        error: 'Text field is required'
      };
    }

    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/cours/courses/${courseId}/comments/`,
      { text: content }, // Changed content to text to match API expectation
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Create course comment error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение комментариев к уроку
export const getLessonComments = async (lessonId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/lessons/${lessonId}/comments/`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count
    };
  } catch (error) {
    console.error('Get lesson comments error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Создание комментария к уроку
export const createLessonComment = async (lessonId, content) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/cours/lessons/${lessonId}/comments/`,
      { content },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Create lesson comment error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение курсов пользователя
export const getUserCourses = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_BASE_URL}/cours/user/courses/`,
      {
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    );
    return {
      success: true,
      data: response.data.data,
      count: response.data.count
    };
  } catch (error) {
    console.error('Get user courses error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Покупка курса
export const purchaseCourse = async (courseId) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/cours/courses/purchase/`,
      { course_id: courseId },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      success: true,
      message: response.data.message,
      userBalance: response.data.user_balance
    };
  } catch (error) {
    console.error('Purchase course error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Завершение урока
export const completeLesson = async (lessonId) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/cours/lessons/complete/`,
      { lesson_id: lessonId },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      success: true,
      message: response.data.message,
      earnedPoints: response.data.earned_points,
      totalEarnedPoints: response.data.total_earned_points,
      progress: response.data.progress,
      userBalance: response.data.user_balance
    };
  } catch (error) {
    console.error('Complete lesson error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение прогресса по курсу
export const getCourseProgress = async (courseId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_BASE_URL}/cours/user/courses/${courseId}/progress/`,
      {
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    );
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get course progress error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Поиск курсов
export const searchCourses = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/courses/search/?q=${encodeURIComponent(query)}`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      query: response.data.query
    };
  } catch (error) {
    console.error('Search courses error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение курсов по уровню
export const getCoursesByLevel = async (minLevel) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cours/courses/level/${minLevel}/`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      maxLevel: response.data.max_level
    };
  } catch (error) {
    console.error('Get courses by level error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение доступных курсов для пользователя
export const getAvailableCourses = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_BASE_URL}/cours/user/courses/available/`,
      {
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    );
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      userLevel: response.data.user_level,
      userBalance: response.data.user_balance
    };
  } catch (error) {
    console.error('Get available courses error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Получение всех курсов с информацией о покупке
export const getAllCoursesWithPurchaseInfo = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_BASE_URL}/cours/user/courses/all/`,
      {
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    );
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      userLevel: response.data.user_level,
      userBalance: response.data.user_balance
    };
  } catch (error) {
    console.error('Get all courses with purchase info error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Добавляем недостающие функции для уроков
export const getLessonById = async (courseId, lessonId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/cours/courses/${courseId}/lessons/${lessonId}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get lesson by id error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

export const addLessonComment = async (courseId, lessonId, commentData) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_BASE_URL}/cours/courses/${courseId}/lessons/${lessonId}/comments/`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Add lesson comment error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Экспорт объекта API для удобства использования
export const coursesAPI = {
  getCourses,
  getCourseById,
  getCourseLessons,
  getCourseComments,
  createCourseComment,
  getLessonComments,
  createLessonComment,
  getUserCourses,
  purchaseCourse,
  completeLesson,
  getCourseProgress,
  searchCourses,
  getCoursesByLevel,
  getAvailableCourses,
  getAllCoursesWithPurchaseInfo,
  getLessonById,
  addLessonComment
};