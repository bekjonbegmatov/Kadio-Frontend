import React from 'react';
import { FiSettings, FiBell, FiHelpCircle, FiHexagon } from 'react-icons/fi';
import { RiDashboardLine } from 'react-icons/ri';
import { IoTrophyOutline, IoFlashOutline, IoGiftOutline } from 'react-icons/io5';
import { useProfile } from '../../store/ProfileContext';
import './Navbar.css';

import owl from '../../assets/img/navbar/owl.png';

const Navbar = ({ toggleSidebar }) => {
  const { profile, loading } = useProfile();
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="logo">
            <img src={owl} alt="logo" width={70} />
            <span className="logo-text">EdFlow - Kut busang ham odam bul</span>
          </div>
        </div>
        <div className="navbar-actions">
          <div className="image-item">
            <img src="https://media.moddb.com/images/mods/1/52/51810/R.png" alt="Diamonds" className='img-icon' srcSet="" />
            <span className="-value">{loading ? '...' : (profile?.diamonds || 0)}</span>
          </div>
          <div className="image-item">
            <img src="https://cdn3.iconfinder.com/data/icons/video-game-25/64/Trophy-winner-gaming-electronics-compettition-512.png" alt="Coins" className='img-icon' srcSet="" />
            <span className="-value">{loading ? '...' : (profile?.coins || 0)}</span>
          </div>

          <button className="action-btn notification-btn">
            <FiBell className="" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;