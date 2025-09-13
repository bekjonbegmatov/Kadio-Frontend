import React from 'react';
import AppRouter from './router/AppRouter';
import { ProfileProvider } from './store/ProfileContext';
import './App.css';

function App() {
  return (
    <ProfileProvider>
      <div className="App">
        <AppRouter />
      </div>
    </ProfileProvider>
  );
}

export default App;
