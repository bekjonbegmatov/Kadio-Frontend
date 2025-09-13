import React, { useState, useEffect } from 'react';
import { getUserActivity } from '../../../api/auth';
import ActivityChart from './ActivityChart';
import ActivityCalendar from './ActivityCalendar';
import DayDetailsModal from './DayDetailsModal';
import './UserActivity.css';





function UserActivity() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayDetails, setDayDetails] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' или 'chart'

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        setLoading(true);
        try {
            console.log('Fetching activity data...');
            const result = await getUserActivity();
            console.log('Activity API result:', result);
            
            if (result.success) {
                console.log('Raw activity data:', result.data);
                const processedData = processActivityData(result.data);
                console.log('Processed activity data:', processedData);
                setData(processedData);
                setError('');
            } else {
                console.error('Activity fetch failed:', result.error);
                setError(result.error || 'Ошибка загрузки активности');
            }
        } catch (err) {
            console.error('Network error:', err);
            setError('Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    const processActivityData = (rawData) => {
        console.log('Processing raw data:', rawData);
        
        // Проверяем, что rawData существует и является массивом
        if (!rawData || !Array.isArray(rawData)) {
            console.warn('processActivityData: Invalid rawData', rawData);
            return [];
        }
        
        // Группируем активности по дням
        const activityByDate = {};
        const actionsByDate = {};
        
        rawData.forEach(activity => {
            // Проверяем структуру данных активности
            if (!activity || !activity.timestamp) {
                console.warn('Invalid activity data:', activity);
                return;
            }
            
            const date = activity.timestamp.split('T')[0];
            if (!activityByDate[date]) {
                activityByDate[date] = 0;
                actionsByDate[date] = [];
            }
            activityByDate[date]++;
            actionsByDate[date].push({
                id: activity.id,
                action: activity.action,
                timestamp: activity.timestamp
            });
        });
        
        console.log('Activity by date:', activityByDate);

        // Сохраняем детали для отображения
        window.activityDetails = actionsByDate;

        // Преобразуем в формат для календаря - только текущий месяц
        const calendarData = [];
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const count = activityByDate[dateStr] || 0;
            
            calendarData.push({
                date: dateStr,
                count: count,
                level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4
            });
        }

        return calendarData;
    };

    const handleDayClick = (day) => {
        if (day) {
            setSelectedDay(day.date);
            const details = window.activityDetails[day.date] || [];
            setDayDetails(details);
            setIsModalOpen(true);
        } else {
            setSelectedDay(null);
            setDayDetails([]);
            setIsModalOpen(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDay(null);
        setDayDetails([]);
    };

    const toggleViewMode = () => {
        setViewMode(viewMode === 'calendar' ? 'chart' : 'calendar');
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="user-activity-container">
                <div className="activity-header">
                    <h2>Календарь активности</h2>
                </div>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка активности...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-activity-container">
                <div className="activity-header">
                    <h2>Календарь активности</h2>
                </div>
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchActivityData} className="retry-btn">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-activity-container">
            <div className="activity-header">
                {/* <h2>Активность пользователя</h2> */}
                <p className="activity-subtitle">Ваша активность за текущий месяц</p>
                <div className="view-mode-toggle">
                    <button 
                        className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        📅 Календарь
                    </button>
                    <button 
                        className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
                        onClick={() => setViewMode('chart')}
                    >
                        📊 График
                    </button>
                </div>
            </div>

            {!loading && !error && (
                <>
                    {viewMode === 'calendar' ? (
                        <div className="custom-calendar-wrapper">
                            <ActivityCalendar
                                data={data}
                                onDayClick={handleDayClick}
                                selectedDay={selectedDay}
                            />
                        </div>
                    ) : (
                        <div className="chart-wrapper">
                            <ActivityChart data={data} />
                        </div>
                    )}
                </>
            )}

            {/* Модальное окно для деталей дня */}
            <DayDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedDay={selectedDay}
                dayDetails={dayDetails}
            />
        </div>
    );
}

export default UserActivity;
