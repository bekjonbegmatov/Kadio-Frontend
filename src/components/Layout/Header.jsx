import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const links = [
    {
      name: 'Главная',
      path: '/'
    },
    {
      name: 'О нас',
      path: '/about'
    },
    {
      name: 'Контакты',
      path: '/contact'
    }
  ]
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">Edflow - Учись в своём потоке</Link>
        </div>
        
        <nav className="navigation">
          <ul>
            {links.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.name}</Link>
              </li>
            ))}
            <li><Link to="/contact">Контакты</Link></li>
          </ul>
        </nav>
        
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">

            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn">Войти</button>
              <button className="register-btn">Регистрация</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;