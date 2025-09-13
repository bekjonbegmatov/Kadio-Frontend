import React, { useState } from 'react';
import './ActivityCalendar.css';

function ActivityCalendar({ data, onDayClick, selectedDay }) {
    const [calendarSize, setCalendarSize] = useState(60);
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Получаем количество дней в месяце
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Создаем массив дней для компактного отображения в 3 ряда
    const createCompactCalendar = () => {
        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = data.find(d => d.date === dateStr);
            days.push({
                day,
                date: dateStr,
                count: dayData ? dayData.count : 0,
                level: dayData ? dayData.level : 0
            });
        }
        
        // Добавляем пустые ячейки для выравнивания до 3 рядов
        const totalCells = Math.ceil(daysInMonth / 3) * 3;
        while (days.length < totalCells) {
            days.push(null);
        }
        
        return days;
    };
    
    const calendarDays = createCompactCalendar();
    const daysPerRow = Math.ceil(daysInMonth / 3);
    
    const getActivityColor = (level) => {
        const colors = {
            0: '#f1f5f9',
            1: '#dcfce7',
            2: '#bbf7d0', 
            3: '#86efac',
            4: '#4ade80',
            5: '#3b82f6',
            6: '#2563eb',
            7: '#1d4ed8',
        };
        return colors[level] || colors[0];
    };
    
    const handleDayClick = (dayData) => {
        if (onDayClick) {
            onDayClick(dayData);
        }
    };
    
    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <h3>{monthNames[currentMonth]} {currentYear}</h3>
            </div>
            
            <div 
                className="custom-calendar"
                style={{
                    '--day-size': `${calendarSize}px`,
                    '--day-font-size': `${Math.max(10, calendarSize * 0.35)}px`,
                    '--day-gap': `${Math.max(2, calendarSize * 0.08)}px`,
                    '--day-size-mobile': `${Math.max(25, calendarSize * 0.8)}px`,
                    '--day-font-size-mobile': `${Math.max(9, calendarSize * 0.28)}px`
                }}
            >   
                <div 
                    className="calendar-grid"
                    style={{
                        gridTemplateColumns: `repeat(${daysPerRow}, 1fr)`,
                        gridTemplateRows: 'repeat(3, 1fr)'
                    }}
                >
                    {calendarDays.map((dayData, index) => (
                        <div 
                            key={index}
                            className={`calendar-day ${
                                dayData ? 'has-day' : 'empty-day'
                            } ${
                                dayData && selectedDay && dayData.date === selectedDay.date ? 'selected' : ''
                            } ${
                                dayData && dayData.count > 0 ? 'has-activity' : ''
                            }`}
                            style={{
                                backgroundColor: dayData ? getActivityColor(dayData.level) : 'transparent'
                            }}
                            onClick={() => handleDayClick(dayData)}
                            title={dayData ? `${dayData.day} ${monthNames[currentMonth]} - ${dayData.count} активностей` : ''}
                        >
                            {dayData ? dayData.day : ''}
                        </div>
                    ))}
                </div>
                
                <div className="calendar-legend">
                    <span className="legend-label">Меньше</span>
                    <div className="legend-colors">
                        {[0, 1, 2, 3, 4].map(level => (
                            <div 
                                key={level}
                                className="legend-color"
                                style={{ backgroundColor: getActivityColor(level) }}
                            />
                        ))}
                    </div>
                    <span className="legend-label">Больше</span>
                </div>
            </div>
        </div>
    );
}

export default ActivityCalendar;