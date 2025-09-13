import React from 'react';
import { FiSettings, FiBell, FiHelpCircle, FiHexagon } from 'react-icons/fi';
import { RiDashboardLine } from 'react-icons/ri';
import { IoTrophyOutline, IoFlashOutline, IoGiftOutline } from 'react-icons/io5';
import './Navbar.css';

import owl from '../../assets/img/navbar/owl.png';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="logo">
            <img src={owl} alt="logo" width={70} />
            <span className="logo-text">EdFlow</span>
          </div>
        </div>
        <div className="navbar-actions">
          <div className="image-item">
            <img src="https://media.moddb.com/images/mods/1/52/51810/R.png" alt="" className='img-icon' srcset="" />
            <span className="-value">60</span>
          </div>
          <div className="image-item">
            <img src="https://cdn3.iconfinder.com/data/icons/video-game-25/64/Trophy-winner-gaming-electronics-compettition-512.png" alt="" className='img-icon' srcset="" />
            <span className="-value">40</span>
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