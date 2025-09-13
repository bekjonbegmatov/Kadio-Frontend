import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Auth from '../pages/Auth';
import ProfilePage from '../pages/ProfilePage';

const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh'
            }}>
              <h1>404 - Страница не найдена</h1>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;