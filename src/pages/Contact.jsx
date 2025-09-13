import React from 'react';

const Contact = () => {
  return (
    <div>
      <h1>Контакты</h1>
      <p>Свяжитесь с нами любым удобным способом.</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Наши контакты</h2>
        <p><strong>Телефон:</strong> +7 (123) 456-78-90</p>
        <p><strong>Email:</strong> info@kadio.com</p>
        <p><strong>Адрес:</strong> г. Москва, ул. Примерная, д. 123</p>
        
        <h2>Режим работы</h2>
        <p>Понедельник - Пятница: 9:00 - 18:00</p>
        <p>Суббота - Воскресенье: выходные</p>
      </div>
    </div>
  );
};

export default Contact;