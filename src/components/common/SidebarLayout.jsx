// SidebarLayout.js (to wrap your main content with the sidebar)
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Sidebar from './Sidebar'; // Assuming you have Sidebar component

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar /> {/* Sidebar for protected routes */}
      <div className="flex-1">{children}</div> {/* Main content */}
    </div>
  );
};

export default SidebarLayout;
