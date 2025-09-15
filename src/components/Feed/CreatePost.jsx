import React, { useState, useRef } from 'react';
import './CreatePost.css';
import { createPost } from '../../api/feed';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Обработка изменений в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очистка ошибки при изменении
    if (error) setError('');
  };

  // Обработка загрузки изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите изображение');
        return;
      }
      
      // Проверка размера файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не должен превышать 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      // Создание превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление изображения
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Валидация формы
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Заголовок обязателен');
      return false;
    }
    
    if (formData.title.length > 200) {
      setError('Заголовок не должен превышать 200 символов');
      return false;
    }
    
    if (!formData.content.trim()) {
      setError('Содержание поста обязательно');
      return false;
    }
    
    if (formData.content.length > 5000) {
      setError('Содержание не должно превышать 5000 символов');
      return false;
    }
    
    return true;
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const postData = new FormData();
      postData.append('title', formData.title.trim());
      postData.append('content', formData.content.trim());
      
      // Обработка тегов
      if (formData.tags.trim()) {
        const tags = formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .slice(0, 10); // Максимум 10 тегов
        postData.append('tags', JSON.stringify(tags));
      }
      
      // Добавление изображения
      if (formData.image) {
        postData.append('image', formData.image);
      }
      
      const newPost = await createPost(postData);
      
      // Уведомление родительского компонента
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      // Сброс формы
      setFormData({
        title: '',
        content: '',
        tags: '',
        image: null
      });
      setImagePreview(null);
      
      // Закрытие модального окна
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      console.error('Ошибка создания поста:', err);
      setError(err.response?.data?.message || 'Произошла ошибка при создании поста');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка нажатия Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <div className="create-post-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-post-header">
          <h2>Создать новый пост</h2>
          <button 
            type="button" 
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form className="create-post-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Заголовок *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Введите заголовок поста..."
              maxLength={200}
              disabled={isSubmitting}
              required
            />
            <div className="char-count">
              {formData.title.length}/200
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Содержание *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Расскажите что-то интересное..."
              rows={8}
              maxLength={5000}
              disabled={isSubmitting}
              required
            />
            <div className="char-count">
              {formData.content.length}/5000
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Теги
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Введите теги через запятую (например: технологии, программирование)"
              disabled={isSubmitting}
            />
            <div className="form-hint">
              Разделяйте теги запятыми. Максимум 10 тегов.
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Изображение
            </label>
            
            {!imagePreview ? (
              <div className="image-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="image-input"
                  disabled={isSubmitting}
                />
                <div className="upload-placeholder">
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p>Нажмите для выбора изображения</p>
                  <span>PNG, JPG, GIF до 5MB</span>
                </div>
              </div>
            ) : (
              <div className="image-preview">
                <img src={imagePreview} alt="Превью" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  disabled={isSubmitting}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner small"></div>
                  Создание...
                </>
              ) : (
                <>
                  <svg className="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Опубликовать
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;