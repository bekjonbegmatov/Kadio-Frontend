import React from 'react';
import './ActivityChart.css';

// Компонент линейного графика активности
const ActivityChart = ({ data }) => {
  console.log('ActivityChart received data:', data);
  
  // Проверяем, что data существует и является массивом
  if (!data || !Array.isArray(data)) {
    console.warn('ActivityChart: Invalid data received', data);
    return (
      <div className="activity-chart">
        <div className="chart-header">
          <h3>График активности за месяц</h3>
          <p>Нет данных для отображения</p>
        </div>
      </div>
    );
  }
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  console.log('Chart parameters:', { currentMonth, currentYear, daysInMonth });
  
  // Подготавливаем данные для графика
  const chartData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = data.find(item => item.date === dateStr);
    chartData.push({
      day,
      count: dayData ? dayData.count : 0,
      date: dateStr
    });
  }
  
  console.log('Chart data prepared:', chartData);
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  console.log('Max count:', maxCount);
  const chartHeight = 220;
  const chartWidth = 480;
  const padding = { top: 15, right: 25, bottom: 35, left: 35 };
  
  const xScale = (day) => padding.left + ((day - 1) / (daysInMonth - 1)) * (chartWidth - padding.left - padding.right);
  const yScale = (count) => chartHeight - padding.bottom - (count / maxCount) * (chartHeight - padding.top - padding.bottom);
  
  // Создаем путь для линии
  const pathData = chartData.map((d, i) => {
    const x = xScale(d.day);
    const y = yScale(d.count);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  // Создаем область под линией
  const areaData = `${pathData} L ${xScale(daysInMonth)} ${yScale(0)} L ${xScale(1)} ${yScale(0)} Z`;
  
  return (
    <div className="activity-chart">
      <div className="chart-header">
        <div className="chart-stats">
          <span className="stat-item">
            <span className="stat-label">Всего активности:</span>
            <span className="stat-value">{chartData.reduce((sum, d) => sum + d.count, 0)}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Активных дней:</span>
            <span className="stat-value">{chartData.filter(d => d.count > 0).length}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Максимум за день:</span>
            <span className="stat-value">{maxCount}</span>
          </span>
        </div>
      </div>
      
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight} className="chart-svg">
          {/* Сетка */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(102, 126, 234, 0.3)" />
              <stop offset="100%" stopColor="rgba(102, 126, 234, 0.05)" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          
          {/* Горизонтальные линии сетки */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <line
              key={ratio}
              x1={padding.left}
              y1={yScale(maxCount * ratio)}
              x2={chartWidth - padding.right}
              y2={yScale(maxCount * ratio)}
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
          
          {/* Вертикальные линии сетки */}
          {[1, Math.floor(daysInMonth / 4), Math.floor(daysInMonth / 2), Math.floor(3 * daysInMonth / 4), daysInMonth].map(day => (
            <line
              key={day}
              x1={xScale(day)}
              y1={padding.top}
              x2={xScale(day)}
              y2={chartHeight - padding.bottom}
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Область под линией */}
          <path
            d={areaData}
            fill="url(#areaGradient)"
            opacity="0.6"
          />
          
          {/* Линия графика */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Точки на графике */}
          {chartData.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.day)}
              cy={yScale(d.count)}
              r="4"
              fill="#667eea"
              stroke="#ffffff"
              strokeWidth="2"
              className="chart-point"
            >
              <title>{`День ${d.day}: ${d.count} активности`}</title>
            </circle>
          ))}
          
          {/* Подписи по оси X */}
          {[1, Math.floor(daysInMonth / 4), Math.floor(daysInMonth / 2), Math.floor(3 * daysInMonth / 4), daysInMonth].map(day => (
            <text
              key={day}
              x={xScale(day)}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#718096"
              fontFamily="Inter, sans-serif"
            >
              {day}
            </text>
          ))}
          
          {/* Подписи по оси Y */}
          {[0, Math.floor(maxCount / 2), maxCount].map(count => (
            <text
              key={count}
              x={padding.left - 10}
              y={yScale(count) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#718096"
              fontFamily="Inter, sans-serif"
            >
              {count}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default ActivityChart;