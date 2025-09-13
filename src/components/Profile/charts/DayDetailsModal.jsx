import React from 'react';
import './DayDetailsModal.css';

// Минималистичное модальное окно для деталей дня
const DayDetailsModal = ({ isOpen, onClose, selectedDay, dayDetails }) => {
  if (!isOpen || !selectedDay) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Активность за {new Date(selectedDay).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {dayDetails && dayDetails.length > 0 ? (
            <>
              <div className="activity-count">
                {dayDetails.length} {dayDetails.length === 1 ? 'активность' : 'активности'}
              </div>
              
              <div className="activity-list">
                {dayDetails.map((activity, index) => {
                  const activityTime = new Date(activity.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <div key={index} className="activity-item">
                      <span className="activity-time">{activityTime}</span>
                      <span className="activity-action">{activity.action}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-activity">
              <p>В этот день активности не было</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailsModal;