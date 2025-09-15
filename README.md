# Kadio Frontend

Фронтенд приложение для образовательной платформы Kadio, созданное с использованием React + Vite.

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/bekjonbegmatov/Kadio-Frontend
cd Kadio-Frontend
```

### 2. Установка зависимостей

Установите необходимые модули с помощью команды:

```bash
npm install
```

### 3. Настройка конфигурации

Откройте файл `src/api/config.js` и укажите правильные значения для `BASE_URL` и `API_BASE_URL`:

```javascript
const BASE_URL = 'http://your-django-server-url:port'
const API_BASE_URL = 'http://your-django-server-url:port/api'
```

**Примечание:** URL можно получить после запуска Django сервера - он покажет адрес, по которому доступен. Этот адрес необходимо указать в конфигурации.

### 4. Запуск приложения

Для локального запуска:

```bash
npm run dev
```

Если хотите, чтобы приложение было доступно на хосте (для доступа с других устройств в сети):

```bash
npm run dev -- --host
```

## Технологии

- React 18
- Vite
- React Router
- CSS Modules
- Axios для API запросов

## Структура проекта

- `src/components/` - React компоненты
- `src/pages/` - Страницы приложения
- `src/api/` - API конфигурация и запросы
- `src/styles/` - Глобальные стили и переменные

---


Создано с ❤️ Bekjon Begmatov для хакатона "ИТ Старт"
