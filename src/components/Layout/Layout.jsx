import React, { useState } from 'react';
import Navbar from '../Navigation/Navbar';
import Sidebar from '../Navigation/Sidebar';

const Layout = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar 
        width={sidebarWidth}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
      />
      <main 
        className="main-content"
        style={{
          marginLeft: isSidebarCollapsed ? '60px' : `${sidebarWidth}px`,
          marginTop: '60px',
          padding: '20px',
          // backgroundColor: '#ffffff',
          minHeight: 'calc(100vh - 60px)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;